
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import api from '../services/api';

import 'leaflet/dist/leaflet.css';

const MapExplorer = () => {
    const [university, setUniversity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                console.log("MapExplorer: Fetching fresh user data...");
                // On ajoute un timestamp pour éviter le cache navigateur
                const userResp = await api.get(`/auth/me/?t=${new Date().getTime()}`);
                console.log("MapExplorer: User data received:", userResp.data);
                
                const uniId = userResp.data.profile?.university; // Dans le JSON, c'est souvent l'ID direct ou l'objet

                if (!uniId) {
                    console.warn("MapExplorer: No university ID found in profile", userResp.data.profile);
                    setError("Université non configurée dans votre profil.");
                    setLoading(false);
                    return;
                }

                const idToFetch = uniId && typeof uniId === 'object' ? uniId.id : uniId;

                console.log(`MapExplorer: Fetching university details for ID ${idToFetch}...`);
                const uniResp = await api.get(`/universities/${idToFetch}/`);
                setUniversity(uniResp.data);
                setLoading(false);
            } catch (err) {
                console.error("MapExplorer: Data fetch failed", err);
                setError("Erreur de chargement. Veuillez réessayer.");
                setLoading(false);
            }
        };
        fetchMapData();
    }, []);

    useEffect(() => {
        if (!loading && university && mapRef.current && !mapInstance.current) {
            try {
                console.log("MapExplorer: Initializing Leaflet map...");

                // Coordonnées de repli (Québec)
                const defaultLat = 46.8139;
                const defaultLng = -71.2080;

                const lat = university.latitude ? parseFloat(university.latitude) : defaultLat;
                const lng = university.longitude ? parseFloat(university.longitude) : defaultLng;

                mapInstance.current = L.map(mapRef.current).setView([lat, lng], 14);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(mapInstance.current);

                // Icône pour l'université
                const uniIcon = L.divIcon({
                    className: 'custom-map-icon',
                    html: `<div style="background-color: #2563eb; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">U</div>`,
                    iconSize: [34, 34],
                    iconAnchor: [17, 17]
                });

                L.marker([lat, lng], { icon: uniIcon })
                    .addTo(mapInstance.current)
                    .bindPopup(`<div style="padding: 5px"><strong>${university.name}</strong><br/>${university.city}</div>`);

                // Icônes pour les Points d'Intérêt (POIs)
                if (university.pois && university.pois.length > 0) {
                    university.pois.forEach(poi => {
                        const plat = parseFloat(poi.latitude);
                        const plng = parseFloat(poi.longitude);
                        
                        if (!isNaN(plat) && !isNaN(plng)) {
                            const poiIcon = L.divIcon({
                                className: 'poi-icon',
                                html: `<div style="background-color: #16a34a; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">📍</div>`,
                                iconSize: [24, 24],
                                iconAnchor: [12, 12]
                            });

                            L.marker([plat, plng], { icon: poiIcon })
                                .addTo(mapInstance.current)
                                .bindPopup(`<b>${poi.name}</b><br/><small>${poi.category}</small><br/>${poi.address}`);
                        }
                    });
                }

                console.log("MapExplorer: Map initialized successfully.");
            } catch (e) {
                console.error("MapExplorer: Leaflet initialization error", e);
                setError("Erreur lors de l'initialisation de la carte.");
            }
        }

        return () => {
            if (mapInstance.current) {
                console.log("MapExplorer: Cleaning up map instance...");
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [loading, university]);

    const renderContent = () => {
        if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
        if (error) return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}><h3>{error}</h3><button onClick={() => window.location.reload()}>Réessayer</button></div>;

        return (
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '15px', background: 'white' }}>
                    <h2 style={{ margin: 0 }}>📍 {university?.name}</h2>
                    <p style={{ margin: 0, color: '#666' }}>Lieux essentiels à {university?.city}</p>
                </div>
                
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
