
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import api from '../services/api';

// IMPORTANT: Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const MapExplorer = () => {
    const [university, setUniversity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    // 1. Fetch Data
    useEffect(() => {
        const fetchMapData = async () => {
            try {
                console.log("MapExplorer: Fetching user...");
                const userResp = await api.get('/auth/me/');
                const uniId = userResp.data.profile?.university?.id;

                if (!uniId) {
                    setError("Université non configurée.");
                    setLoading(false);
                    return;
                }

                console.log("MapExplorer: Fetching university...");
                const uniResp = await api.get(`/universities/${uniId}/`);
                setUniversity(uniResp.data);
                setLoading(false);
            } catch (err) {
                console.error("MapExplorer: Data fetch failed", err);
                setError("Erreur de chargement des données.");
                setLoading(false);
            }
        };
        fetchMapData();
    }, []);

    // 2. Initialize Manual Leaflet (More robust than react-leaflet for debugging)
    useEffect(() => {
        if (!loading && university && mapRef.current && !mapInstance.current) {
            try {
                console.log("MapExplorer: Initializing Leaflet map...");

                const lat = parseFloat(university.latitude) || 46.8139;
                const lng = parseFloat(university.longitude) || -71.2080;

                mapInstance.current = L.map(mapRef.current).setView([lat, lng], 13);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap'
                }).addTo(mapInstance.current);

                // Add University Marker
                const uniIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #2563eb; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">U</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                L.marker([lat, lng], { icon: uniIcon })
                    .addTo(mapInstance.current)
                    .bindPopup(`<b>${university.name}</b>`);

                // Add POIs
                if (university.pois) {
                    university.pois.forEach(poi => {
                        const plat = parseFloat(poi.latitude);
                        const plng = parseFloat(poi.longitude);
                        if (!isNaN(plat) && !isNaN(plng)) {
                            L.marker([plat, plng])
                                .addTo(mapInstance.current)
                                .bindPopup(`<b>${poi.name}</b><br/>${poi.address}`);
                        }
                    });
                }

                console.log("MapExplorer: Map initialized successfully.");
            } catch (e) {
                console.error("MapExplorer: Leaflet initialization error", e);
                setError("Erreur lors de l'initialisation de la carte.");
            }
        }

        // Cleanup on unmount
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [loading, university]);

    // Render logic
    const renderContent = () => {
        if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
        if (error) return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}><h3>{error}</h3><button onClick={() => window.location.reload()}>Réessayer</button></div>;

        return (
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '15px', background: 'white' }}>
                    <h2 style={{ margin: 0 }}>📍 {university?.name}</h2>
                    <p style={{ margin: 0, color: '#666' }}>Lieux essentiels à {university?.city}</p>
                </div>
                {/* This is the actual map container */}
                <div
                    ref={mapRef}
                    style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#e5e7eb', minHeight: '500px' }}
                />
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            <div style={{ background: '#2563eb', color: 'white', padding: '5px 15px', fontSize: '12px' }}>
                Mode de diagnostic : Actif
            </div>
            {renderContent()}
        </div>
    );
};

export default MapExplorer;
