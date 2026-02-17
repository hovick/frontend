"use client";
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
// PRODUCTION READY: Change this to your real domain when deploying (e.g., "https://api.aeroplanner.com")
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
const [user, setUser] = useState<{id: number, username: string, is_premium: boolean} | null>(null);
  const [loginInput, setLoginInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerAsPro, setRegisterAsPro] = useState(false);
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [mounted, setMounted] = useState(false);
  // UI State: "define" or "analyze"
  const [activeTab, setActiveTab] = useState("define");
  const [isGenericMode, setIsGenericMode] = useState(false);
  const genericColor = Cesium.Color.SLATEGRAY.withAlpha(0.5); // Choose your generic color here
  const [isXRayMode, setIsXRayMode] = useState(false);
  // Map Controls State
  const [exaggeration, setExaggeration] = useState(1);
  // Public Surface Search State
  const [pubSurfQuery, setPubSurfQuery] = useState("");
  const [pubSurfResults, setPubSurfResults] = useState<any[]>([]);

  // Open Source Data Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState<any[]>([]);

  // NAVAID specific state
  const [navType, setNavType] = useState("CVOR");
  const [navCoord, setNavCoord] = useState({ lat: 51.47, lon: -0.45, alt: 25 });
  const [navBearing, setNavBearing] = useState(90);
  const [navThr, setNavThr] = useState({ lat: 51.47, lon: -0.42, alt: 25 });
  const isDirectional = ["ILS_LLZ", "ILS_GP", "MLS"].includes(navType);

  // Define State
  const [surfName, setSurfName] = useState("Runway 09/27");
  const [family, setFamily] = useState("OLS"); // OLS, OAS, VSS, etc.
  const [t1, setT1] = useState({ lat: 51.464901, lon: -0.486772, alt: 22.86 });
  const [t2, setT2] = useState({ lat: 51.465, lon: -0.434075, alt: 23.47 });
  const [arpAlt, setArpAlt] = useState(25.3);
  const [runwayType, setRunwayType] = useState("precision");
  
  // VSS specific state
  const [vssParams, setVssParams] = useState({ stripWidth: 150, oca: 100, descentAngle: 3.0 });
  // OFZ specific state
  const [adg, setAdg] = useState("IV");

  // Analyze State
  const [savedSurfaces, setSavedSurfaces] = useState<any[]>([]);
  const [selectedSurfaceId, setSelectedSurfaceId] = useState("");
  const [obsPos, setObsPos] = useState({ lat: 51.475, lon: -0.44, alt: 50 });
  const [customPoints, setCustomPoints] = useState(""); // Stores "lat,lon,alt" string

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("aero_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const handleAuth = async () => {
    if (!loginInput || !passwordInput) return alert("Enter username and password");
    
    if (isRegistering) {
      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: loginInput, password: passwordInput, is_premium: registerAsPro })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          // This will now print the EXACT error FastAPI is throwing
          return alert(`Registration Error: ${data.detail || "Server failed"}`); 
        }
        
        setIsRegistering(false);
        alert("Registration successful! Please log in.");
      } catch (err) {
        alert("Network error: Could not reach the server.");
      }
    } else {
      // OAuth2 requires URL Encoded Form Data for login
      const formData = new URLSearchParams();
      formData.append("username", loginInput);
      formData.append("password", passwordInput);

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData
        });
        const data = await res.json();
        if (data.detail || !data.access_token) return alert(`Login Error: ${data.detail || "Invalid credentials"}`);
        
        localStorage.setItem("aero_token", data.access_token);
        window.location.reload();
      } catch (err) {
        alert("Network error: Could not reach the server.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("aero_token");
    setUser(null);
    setSavedSurfaces([]);
    viewerRef.current?.entities.removeAll();
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      (window as any).CESIUM_BASE_URL = '/cesium/';
    }
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwOTZmOGMwZC1kNTlkLTRkYWUtYWUxZC0wMzBlOWVlNmM3N2QiLCJpZCI6ODM2NDQsImlhdCI6MTY0NTY5NTMxN30.qUC3Y6wM0_bcbb73TLGH87Azql1ZDX5gM_7relGRRSg';
  }, []);

  // Dynamic X-Ray Mode
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.scene.globe.depthTestAgainstTerrain = !isXRayMode;
    }
  }, [isXRayMode]);

  useEffect(() => {
    const token = localStorage.getItem("aero_token");
    if (token) {
      fetch(`${API_BASE}/users/me`, { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setUser(data);
            fetch(`${API_BASE}/get-surfaces`, { headers: { "Authorization": `Bearer ${token}` } })
              .then(r => r.json()).then(surfs => setSavedSurfaces(surfs));
          } else {
            localStorage.removeItem("aero_token");
          }
        });
    }
  }, []);

  useEffect(() => {
    if (mounted && cesiumContainer.current && !viewerRef.current) {
      viewerRef.current = new Cesium.Viewer(cesiumContainer.current, {
        terrain: Cesium.Terrain.fromWorldTerrain(),
        baseLayerPicker: false,
        animation: false,
        timeline: false,
      });
    }
  }, [mounted]);

  // Dynamic Vertical Exaggeration
  useEffect(() => {
    if (viewerRef.current) {
      // Applies the multiplier to both the terrain and the 3D surfaces
      viewerRef.current.scene.verticalExaggeration = exaggeration;
    }
  }, [exaggeration]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const entities = viewerRef.current.entities.values;
    entities.forEach((entity) => {
      if (entity.polygon) {
        if (isGenericMode) {
          entity.polygon.material = new Cesium.ColorMaterialProperty(genericColor);
        } else {
        }
      }
    });
  }, [isGenericMode]);

  // Map Click Listener for Analyze Tab
  useEffect(() => {
    if (!viewerRef.current || !mounted) return;

    let handler: Cesium.ScreenSpaceEventHandler | null = null;

    if (activeTab === "analyze") {
      handler = new Cesium.ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
      
      handler.setInputAction((click: any) => {
        const cartesian = viewerRef.current?.camera.pickEllipsoid(click.position);
        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          const lon = Cesium.Math.toDegrees(cartographic.longitude);
          
          // Update the input boxes
          setObsPos(prev => ({ ...prev, lat: parseFloat(lat.toFixed(6)), lon: parseFloat(lon.toFixed(6)) }));
          
          // Draw a visual marker for the obstacle
          viewerRef.current?.entities.removeById('obs-marker');
          viewerRef.current?.entities.add({
            id: 'obs-marker',
            position: cartesian,
            point: { pixelSize: 12, color: Cesium.Color.RED, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 }
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    return () => {
      if (handler) handler.destroy();
    };
  }, [activeTab, mounted]);

// Handle CSV File Upload for Premium Users
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCustomPoints(text); // Populates the text area automatically!
    };
    reader.readAsText(file);
  };

  // --- BATCH ANALYSIS LOGIC ---
  const handleBatchAnalyze = async () => {
    if (!selectedSurfaceId) return alert("Please select a target surface first!");
    
    // Parse the input text
    const lines = batchInput.split("\n");
    const obsList = lines.map(line => {
      const parts = line.split(",").map(s => s.trim());
      if (parts.length === 4) {
        return { id: parts[0], lat: parseFloat(parts[1]), lon: parseFloat(parts[2]), alt: parseFloat(parts[3]) };
      }
      return null;
    }).filter(o => o !== null);

    if (obsList.length === 0) return alert("No valid obstacles found. Use ID, Lat, Lon, Alt format.");

    const res = await fetch("http://127.0.0.1:8000/analyze-batch", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ surface_id: selectedSurfaceId, obstacles: obsList }),
    });
    
    const data = await res.json();
    if (data.error) return alert(data.error);

    setBatchResults(data.results);

    // --- DRAW RESULTS ON MAP ---
    if (viewerRef.current) {
      // Clean up previous batch markers
      const entitiesToRemove: Cesium.Entity[] = [];
      viewerRef.current.entities.values.forEach(e => {
        if (e.id && e.id.toString().startsWith('batch-obs-')) entitiesToRemove.push(e);
      });
      entitiesToRemove.forEach(e => viewerRef.current?.entities.remove(e));

      // Draw new markers
      data.results.forEach((res: any) => {
        const isPenetrating = res.penetration;
        const color = isPenetrating ? Cesium.Color.RED : Cesium.Color.LIGHTSKYBLUE;
        
        viewerRef.current?.entities.add({
          id: `batch-obs-${res.id}`,
          position: Cesium.Cartesian3.fromDegrees(res.lon, res.lat, res.alt),
          point: { pixelSize: 12, color: color, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
          label: { 
            text: `${res.id}\n${isPenetrating ? '❌' : '✅'}`, 
            font: "10pt sans-serif", 
            style: Cesium.LabelStyle.FILL_AND_OUTLINE, 
            outlineWidth: 2, 
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM, 
            pixelOffset: new Cesium.Cartesian2(0, -10) 
          },
          polyline: { // Draws a vertical line from the ground to the obstacle
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([res.lon, res.lat, 0, res.lon, res.lat, res.alt]),
            width: 2,
            material: color.withAlpha(0.6)
          }
        });
      });
    }
  };

  const downloadBatchCSV = () => {
    if (!batchResults.length) return;
    const headers = ["ID", "Lat", "Lon", "Alt", "Limiting Surface", "Max Allowed (m)", "Margin (m)", "Violation"];
    const rows = batchResults.map(r => [
      r.id, r.lat, r.lon, r.alt, 
      r.limiting_surface, 
      r.allowed_alt ?? "N/A", 
      r.margin ?? "N/A", 
      r.penetration ? "YES" : "NO"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Obstacle_Analysis_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- DATABASE SEARCH LOGIC ---
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    const endpoint = family === "NAVAID" ? "navaids" : "airports";
    const res = await fetch(`http://127.0.0.1:8000/search/${endpoint}?q=${query}`);
    const data = await res.json();
    setSearchResults(data);
    setIsSearching(false);
  };

  const handleSelectRunway = (airport: any, runway: any) => {
    // OurAirports uses feet. We MUST convert to meters (1 ft = 0.3048 m)
    const ftToM = 0.3048;
    const arpAltM = (Number(airport.alt_ft) || 0) * ftToM;
    
    setArpAlt(Number(arpAltM.toFixed(2)));
    setSurfName(`${airport.ident} - RWY ${runway.le_ident}/${runway.he_ident}`);
    
    setT1({
      lat: Number(runway.le_latitude_deg),
      lon: Number(runway.le_longitude_deg),
      alt: Number(((Number(runway.le_elevation_ft) || Number(airport.alt_ft) || 0) * ftToM).toFixed(2))
    });
    
    setT2({
      lat: Number(runway.he_latitude_deg),
      lon: Number(runway.he_longitude_deg),
      alt: Number(((Number(runway.he_elevation_ft) || Number(airport.alt_ft) || 0) * ftToM).toFixed(2))
    });
    
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSelectNavaid = (navaid: any) => {
    setSurfName(`${navaid.ident} - ${navaid.name} (${navaid.type})`);
    setNavCoord({
      lat: Number(navaid.lat),
      lon: Number(navaid.lon),
      alt: Number(((Number(navaid.alt_ft) || 0) * 0.3048).toFixed(2))
    });
    
    // Auto-select type if it matches our dropdown
    if (navaid.type.includes("VOR")) setNavType("CVOR");
    if (navaid.type === "DME") setNavType("DME");
    if (navaid.type === "NDB") setNavType("NDB");
    
    setSearchResults([]);
    setSearchQuery("");
  };

  // --- DASHBOARD LOGIC ---
  const handleDeleteSurface = async (surfaceId: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this surface?");
    if (!confirmDelete) return;

    const res = await fetch(`${API_BASE}/create-surface`, {
      method: "DELETE"
    });
    const data = await res.json();
    
    if (data.error) return alert(data.error);
    
    // Remove from UI state
    setSavedSurfaces(prev => prev.filter(s => s.id !== surfaceId));
    if (selectedSurfaceId === surfaceId) setSelectedSurfaceId("");
  };

  const handleDrawSurface = (surface: any) => {
    if (!viewerRef.current) return;
    
    // Clear map and load new surface
    viewerRef.current.entities.removeAll();
    const entitiesToAdd: Cesium.Entity[] = [];

    surface.geometry.forEach((geo: any) => {
        const entity = viewerRef.current?.entities.add({
            name: geo.name,
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(geo.coords),
                perPositionHeight: true, 
                material: isGenericMode 
                  ? genericColor
                  : Cesium.Color.fromCssColorString(geo.color).withAlpha(0.4),
                outline: true,
                outlineColor: Cesium.Color.BLACK
            }
        });
        if (entity) entitiesToAdd.push(entity);
    });

    viewerRef.current.zoomTo(entitiesToAdd, new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0), 
        Cesium.Math.toRadians(-45), 
        5000 
    ));
  };

  // --- PUBLIC SURFACE SEARCH LOGIC ---
  const handleSearchPublicSurfaces = async (query: string) => {
    setPubSurfQuery(query);
    if (query.length < 2) {
      setPubSurfResults([]);
      return;
    }
    const res = await fetch(`http://127.0.0.1:8000/search/public-surfaces?q=${query}`);
    const data = await res.json();
    setPubSurfResults(data);
  };

  const handleExport = async (format: 'kml' | 'dxf') => {
    const res = await fetch(`${API_BASE}/export/${format}/${selectedSurfaceId}`, {
      headers: getAuthHeaders() // Inject our Premium JWT Token!
    });
    
    if (!res.ok) {
      const err = await res.json();
      return alert(`Export Error: ${err.detail}`);
    }
    
    // Convert the response to a file and trigger a silent download
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `airspace_export.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

 const handleDefine = async () => {
    let bodyData: any = {
        name: surfName,
        surface_family: family,
        runway_type: runwayType,
        t1, t2, arp_alt: arpAlt,
        vss_params: family === "VSS" ? vssParams : null,
        adg: family === "OFZ" ? adg : null,
        navaid_params: family === "NAVAID" ? {
            n_type: navType,
            lat: navCoord.lat,
            lon: navCoord.lon,
            alt: navCoord.alt,
            bearing: navBearing,
            thr_lat: navThr.lat,
            thr_lon: navThr.lon,
            thr_alt: navThr.alt
        } : null
    };
    if (family === "CUSTOM") {
            const lines = customPoints.split("\n");
            const coords = lines.map(line => {
                const parts = line.split(",").map(s => s.trim());
                // Expecting 4 parts: id, lat, lon, alt
                if (parts.length === 4) {
                    return { 
                        id: parts[0], 
                        lat: parseFloat(parts[1]), 
                        lon: parseFloat(parts[2]), 
                        alt: parseFloat(parts[3]) 
                    };
                }
                return null;
            }).filter(p => p !== null);

            bodyData = { ...bodyData, custom_coords: coords };
      }
      
    const res = await fetch(`${API_BASE}/create-surface`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(bodyData),
    });

    const data = await res.json();
    if (data.error) return alert(data.error); // Catch DB limits
    
    if (viewerRef.current && data.geometry) {
        // 1. Clear previous entities and enable terrain depth testing
        viewerRef.current.entities.removeAll();
        
        // 2. Define the array at the start of the block so it is accessible everywhere
        const entitiesToAdd: Cesium.Entity[] = [];

        data.geometry.forEach((geo: any) => {
            const entity = viewerRef.current?.entities.add({
                name: geo.name,
                polygon: {
                    hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(geo.coords),
                    // Enabling perPositionHeight gives the surfaces their 3D altitude
                    perPositionHeight: true, 
                    material: isGenericMode 
                      ? genericColor
                      : Cesium.Color.fromCssColorString(geo.color).withAlpha(0.4),
                    outline: true,
                    outlineColor: Cesium.Color.BLACK
                }
            });
            if (entity) entitiesToAdd.push(entity);
        });

        // 3. ZOOM IN: Now 'entitiesToAdd' is correctly populated and in scope
        viewerRef.current.zoomTo(entitiesToAdd, new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(0), 
            Cesium.Math.toRadians(-45), 
            5000 
        ));

        // Update the list of surfaces for the Analyze tab
        setSavedSurfaces(prev => [...prev, data]);

    if (!user) {
        // Guests only get 1 surface. Overwrite the array.
        setSavedSurfaces([data]);
        setSelectedSurfaceId(data.id); // Auto-select it for them
    } else {
        // Pros get up to 10. Append it.
        setSavedSurfaces(prev => [...prev, data]);
    }
    }
  };

  if (!mounted) return <div style={{ backgroundColor: "#111", height: "100vh" }} />;

  return (
    <main style={{ display: "flex", height: "100vh", width: "100vw", position: "relative" }}>
      {/* MAP CONTANER */}
      <div ref={cesiumContainer} style={{ flex: 1 }} />

      {/* --- EXAGGERATION WIDGET --- */}
      <div style={{
        position: "absolute",
        bottom: "30px",
        right: "30px", // Puts it in the bottom right corner of the map
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "10px 15px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        width: "200px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#333", margin: 0 }}>
            3D Exaggeration
          </label>
          <span style={{ fontSize: "12px", color: "#007bff", fontWeight: "bold" }}>
            {exaggeration}x
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={exaggeration}
          onChange={(e) => setExaggeration(parseFloat(e.target.value))}
          style={{ width: "100%", cursor: "pointer" }}
        />
      </div>
      {/* --------------------------- */}

      {/* --- ACCOUNT / LOGIN PANEL (Floating Box) --- */}
      <div style={{ position: "absolute", top: "20px", right: "20px", width: "300px", backgroundColor: "rgba(255, 255, 255, 0.95)", padding: "15px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "1px solid #ddd", zIndex: 10 }}>
        {!user ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "14px", color: "#333" }}>{isRegistering ? "Register Account" : "Guest Mode"}</strong>
              {!isRegistering && <span style={{ fontSize: "10px", backgroundColor: "#e2e3e5", padding: "2px 6px", borderRadius: "4px" }}>Free</span>}
            </div>
            
            {!isRegistering && <p style={{ fontSize: "11px", color: "#666", margin: 0 }}>Create 1 surface as a guest, or log in.</p>}
            <hr style={{ margin: "5px 0", borderTop: "1px solid #ddd" }} />
            
            <input style={{...inputStyle, padding: "6px"}} value={loginInput} onChange={e => setLoginInput(e.target.value)} placeholder="Username" />
            <input type="password" style={{...inputStyle, padding: "6px"}} value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Password" />
            
            {isRegistering && (
              <label style={{ fontSize: "11px", display: "flex", gap: "5px", alignItems: "center" }}>
                <input type="checkbox" checked={registerAsPro} onChange={e => setRegisterAsPro(e.target.checked)} />
                Register as Premium (Test Mode)
              </label>
            )}

            <button style={{...activeTabBtn, padding: "8px", backgroundColor: isRegistering ? "#28a745" : "#007bff"}} onClick={handleAuth}>
              {isRegistering ? "Sign Up" : "Log In"}
            </button>
            <button style={{ backgroundColor: "transparent", border: "none", color: "#007bff", fontSize: "11px", cursor: "pointer", marginTop: "5px" }} onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Already have an account? Log in." : "Create an account"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px" }}>
              👤 {user.username} {user.is_premium && <span style={{ color: "gold", textShadow: "0 0 2px rgba(0,0,0,0.2)" }}>★ PRO</span>}
            </span>
            <button onClick={handleLogout} style={{ fontSize: "12px", padding: "4px 8px", cursor: "pointer", backgroundColor: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px" }}>Logout</button>
          </div>
        )}
      </div>

      {/* SINGLE INTERACTIVE SIDEBAR */}
      <div style={sidebarStyle}>
        {/* VISUALIZATION TOGGLES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "15px" }}>
          <label style={{ fontSize: "12px", display: "flex", gap: "5px", alignItems: "center" }}>
            <input type="checkbox" checked={isXRayMode} onChange={e => setIsXRayMode(e.target.checked)} />
            X-Ray Mode (See surfaces through terrain)
          </label>
          <label style={{ fontSize: "12px", display: "flex", gap: "5px", alignItems: "center" }}>
            <input type="checkbox" checked={isGenericMode} onChange={e => setIsGenericMode(e.target.checked)} />
            Activate Generic Color Mode (Blueprint)
          </label>
        </div>

        {/* TAB NAVIGATION */}
        <div style={{ display: "flex", marginBottom: "15px", gap: "5px" }}>
          <button 
            style={activeTab === "define" ? activeTabBtn : inactiveTabBtn} 
            onClick={() => setActiveTab("define")}>DEFINE</button>
          <button 
            style={activeTab === "analyze" ? activeTabBtn : inactiveTabBtn} 
            onClick={() => setActiveTab("analyze")}>ANALYZE</button>
          <button 
            style={activeTab === "dashboard" ? activeTabBtn : inactiveTabBtn} 
            onClick={() => setActiveTab("dashboard")}>DASHBOARD</button>
        </div>

        {/* --- DEFINE TAB --- */}
        {activeTab === "define" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* --- PREMIUM OPEN SOURCE SEARCH --- */}
            <div style={{ backgroundColor: "#e8f0fe", padding: "10px", borderRadius: "4px", border: "1px solid #cce5ff", opacity: user?.is_premium ? 1 : 0.6, position: "relative" }}>
              <label style={{...labelStyle, color: "#1a73e8", display: "block", marginBottom: "5px"}}>
                ★ Premium Database Search 
              </label>
              
              <input 
                style={inputStyle} 
                value={searchQuery} 
                onChange={e => handleSearch(e.target.value)} 
                placeholder={family === "NAVAID" ? "Search Navaid (e.g. JFK or Kennedy)" : "Search Airport ICAO or Name (e.g. EGLL or Heathrow)"}
                disabled={!user?.is_premium}
              />
              
              {!user?.is_premium && (
                <p style={{ color: "red", fontSize: "11px", marginTop: "5px", marginBottom: 0 }}>
                  Log in to a Premium account to auto-fill global coordinates.
                </p>
              )}

              {/* SEARCH RESULTS DROPDOWN */}
              {searchResults.length > 0 && user?.is_premium && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "white", border: "1px solid #ccc", zIndex: 100, maxHeight: "300px", overflowY: "auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                  {family === "NAVAID" ? (
                    // NAVAID RESULTS
                    searchResults.map((nav, idx) => (
                      <div key={idx} onClick={() => handleSelectNavaid(nav)} style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer", fontSize: "12px" }}>
                        <strong>{nav.ident}</strong> - {nav.name} <span style={{ color: "gray" }}>({nav.type})</span>
                      </div>
                    ))
                  ) : (
                    // AIRPORT RESULTS
                    searchResults.map((apt, idx) => (
                      <div key={idx} style={{ padding: "8px", borderBottom: "1px solid #eee", fontSize: "12px" }}>
                        <strong>{apt.ident}</strong> - {apt.name}
                        <div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {apt.runways.map((rwy: any, rIdx: number) => (
                            <button 
                              key={rIdx} 
                              onClick={() => handleSelectRunway(apt, rwy)}
                              style={{ padding: "2px 6px", fontSize: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                            >
                              RWY {rwy.le_ident}/{rwy.he_ident}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* --------------------------------- */}

            <label style={labelStyle}>Surface Name</label>
            <input style={inputStyle} value={surfName} onChange={e => setSurfName(e.target.value)} placeholder="Name (e.g., RWY 09/27)" />
            
            <label style={labelStyle}>Surface Family</label>
            <select style={inputStyle} value={family} onChange={e => setFamily(e.target.value)}>
              <option value="OLS">OLS (Annex 14)</option>
              <option value="OAS">OAS (PANS-OPS)</option>
              <option value="VSS">VSS (Visual Segment)</option>
              <option value="OFZ">OFZ / OES</option>
              <option value="NAVAID">Navaid Restrictive</option>
              <option value="CUSTOM">Custom Surface</option>
            </select>

            <label style={labelStyle}>Threshold 1 (Lat / Lon / Alt)</label>
            <div style={rowStyle}>
              <input style={numInputStyle} type="number" value={t1.lat} onChange={e => setT1({...t1, lat: +e.target.value})} />
              <input style={numInputStyle} type="number" value={t1.lon} onChange={e => setT1({...t1, lon: +e.target.value})} />
              <input style={numInputStyle} type="number" value={t1.alt} onChange={e => setT1({...t1, alt: +e.target.value})} />
            </div>

            <label style={labelStyle}>Threshold 2 (Lat / Lon / Alt)</label>
            <div style={rowStyle}>
              <input style={numInputStyle} type="number" value={t2.lat} onChange={e => setT2({...t2, lat: +e.target.value})} />
              <input style={numInputStyle} type="number" value={t2.lon} onChange={e => setT2({...t2, lon: +e.target.value})} />
              <input style={numInputStyle} type="number" value={t2.alt} onChange={e => setT2({...t2, alt: +e.target.value})} />
            </div>

            <label style={labelStyle}>ARP Altitude (m)</label>
            <input style={inputStyle} type="number" value={arpAlt} onChange={e => setArpAlt(+e.target.value)} />

            {/* NEW RUNWAY TYPE DROPDOWN (Only show for OLS) */}
            {(family === "OLS" || family === "OFZ") && (
              <>
                <label style={labelStyle}>Runway Type</label>
                <select style={inputStyle} value={runwayType} onChange={e => setRunwayType(e.target.value)}>
                  <option value="non_instrument">Non-Instrument</option>
                  <option value="non_precision">Non-Precision Approach</option>
                  <option value="precision">Precision Approach</option>
                </select>
              </>
            )}

            {/* DYNAMIC VSS FIELDS */}
            {family === "VSS" && (
              <div style={{ backgroundColor: "#e9ecef", padding: "10px", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={labelStyle}>Strip Width (m)</label>
                <input style={inputStyle} type="number" value={vssParams.stripWidth} onChange={e => setVssParams({...vssParams, stripWidth: +e.target.value})} />
                <label style={labelStyle}>OCA (m)</label>
                <input style={inputStyle} type="number" value={vssParams.oca} onChange={e => setVssParams({...vssParams, oca: +e.target.value})} />
                <label style={labelStyle}>Descent Angle (°)</label>
                <input style={inputStyle} type="number" value={vssParams.descentAngle} onChange={e => setVssParams({...vssParams, descentAngle: +e.target.value})} />
              </div>
            )}

            {/* DYNAMIC NAVAID FIELDS */}
            {family === "NAVAID" && (
              <div style={{ backgroundColor: "#e9ecef", padding: "10px", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={labelStyle}>Facility Type (EUR Doc 015)</label>
                <select style={inputStyle} value={navType} onChange={e => setNavType(e.target.value)}>
                  <optgroup label="Omni-directional">
                    <option value="CVOR">CVOR (Conventional VOR)</option>
                    <option value="DVOR">DVOR (Doppler VOR)</option>
                    <option value="DF">DF (Direction Finder)</option>
                    <option value="DME">DME</option>
                    <option value="NDB">NDB</option>
                  </optgroup>
                  <optgroup label="Directional">
                    <option value="ILS_LLZ">ILS Localizer (LLZ)</option>
                    <option value="ILS_GP">ILS Glide Path (GP)</option>
                    <option value="MLS">MLS</option>
                  </optgroup>
                </select>

                <label style={labelStyle}>Antenna Coordinates (Lat / Lon / Alt)</label>
                <div style={rowStyle}>
                  <input style={numInputStyle} type="number" value={navCoord.lat} onChange={e => setNavCoord({...navCoord, lat: +e.target.value})} />
                  <input style={numInputStyle} type="number" value={navCoord.lon} onChange={e => setNavCoord({...navCoord, lon: +e.target.value})} />
                  <input style={numInputStyle} type="number" value={navCoord.alt} onChange={e => setNavCoord({...navCoord, alt: +e.target.value})} />
                </div>

                {/* SHOW BEARING & THRESHOLD ONLY FOR DIRECTIONAL FACILITIES */}
                {isDirectional && (
                  <>
                    <label style={labelStyle}>Operational Bearing (°)</label>
                    <input style={inputStyle} type="number" value={navBearing} onChange={e => setNavBearing(+e.target.value)} />
                    
                    <label style={labelStyle}>Reference Threshold (Lat / Lon / Alt)</label>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={navThr.lat} onChange={e => setNavThr({...navThr, lat: +e.target.value})} />
                      <input style={numInputStyle} type="number" value={navThr.lon} onChange={e => setNavThr({...navThr, lon: +e.target.value})} />
                      <input style={numInputStyle} type="number" value={navThr.alt} onChange={e => setNavThr({...navThr, alt: +e.target.value})} />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* DYNAMIC OFZ FIELDS */}
            {family === "OFZ" && (
              <div style={{ backgroundColor: "#e9ecef", padding: "10px", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={labelStyle}>Aeroplane Design Group (ADG)</label>
                <select style={inputStyle} value={adg} onChange={e => setAdg(e.target.value)}>
                  <option value="I">I (Wingspan &lt; 24m)</option>
                  <option value="IIA">IIA (Wingspan 24m - 36m)</option>
                  <option value="IIB">IIB (Wingspan &lt; 36m, Faster App)</option>
                  <option value="IIC">IIC (Wingspan &lt; 36m, High Speed)</option>
                  <option value="III">III (Wingspan 36m - 52m)</option>
                  <option value="IV">IV (Wingspan 52m - 65m)</option>
                  <option value="V">V (Wingspan 65m - 80m)</option>
                </select>
              </div>
            )}

            {family === "CUSTOM" && (
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px", opacity: user?.is_premium ? 1 : 0.6 }}>
                 <label style={{...labelStyle, color: "#d4af37"}}>★ Premium Feature: Batch CSV Upload</label>
                 <input 
                    type="file" 
                    accept=".csv,.txt" 
                    onChange={handleFileUpload} 
                    style={inputStyle} 
                    disabled={!user?.is_premium}
                 />
                 
                 <label style={labelStyle}>Coordinates (ID, Lat, Lon, Alt)</label>
                 <textarea 
                    style={{ ...inputStyle, height: "120px", fontFamily: "monospace" }} 
                    placeholder={`Surface_A, 51.47, -0.45, 100\nSurface_A, 51.47, -0.44, 100\n...`}
                    value={customPoints}
                    onChange={e => setCustomPoints(e.target.value)}
                    disabled={!user?.is_premium}
                 />
                 {!user?.is_premium && <p style={{ color: "red", fontSize: "12px", margin: 0 }}>Please upgrade to Premium to define Custom Surfaces.</p>}
              </div>
            )}

            <button onClick={handleDefine} style={createBtnStyle}>Create {family}</button>
          </div>
        )}

        {/* --- ANALYZE TAB --- */}
        {activeTab === "analyze" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            
            {/* 1. PUBLIC PREMIUM SURFACES SEARCH */}
            <div style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", position: "relative" }}>
              <label style={{...labelStyle, color: "#1a73e8", display: "block", marginBottom: "5px"}}>
                Search Verified Surfaces (CAA surfaces)
              </label>
              <input 
                style={inputStyle} 
                value={pubSurfQuery}
                onChange={e => handleSearchPublicSurfaces(e.target.value)}
                placeholder="e.g. KJFK - RWY 04L..."
              />
              {/* SEARCH RESULTS AUTOCOMPLETE */}
              {pubSurfResults.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "white", border: "1px solid #ccc", zIndex: 100, maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                  {pubSurfResults.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => {
                        setSelectedSurfaceId(s.id);
                        setPubSurfQuery(`${s.name} (${s.family})`); // Fill the box with the selection
                        setPubSurfResults([]); // Close the dropdown
                      }}
                      style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer", fontSize: "12px" }}
                    >
                      <strong>{s.name}</strong> <span style={{color: "gray"}}>({s.family})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. MY SURFACES DROPDOWN */}
            <label style={labelStyle}>Or select from your saved configurations</label>
            <select 
              style={inputStyle} 
              // If the selected ID isn't in their personal list (i.e. it came from the public search), show the default option
              value={savedSurfaces.some(s => s.id === selectedSurfaceId) ? selectedSurfaceId : ""} 
              onChange={e => {
                setSelectedSurfaceId(e.target.value);
                setPubSurfQuery(""); // Clear the public search box if they select their own
              }}
            >
              <option value="">Select your surface...</option>
              {savedSurfaces.map(s => <option key={s.id} value={s.id}>{s.name} ({s.family})</option>)}
            </select>
            
            <hr style={{ borderTop: "1px solid #eee", width: "100%" }}/>
            
            <label style={labelStyle}>Obstacle (Lat / Lon / Alt)</label>
            <div style={rowStyle}>
              <input style={numInputStyle} type="number" value={obsPos.lat} onChange={e => setObsPos({...obsPos, lat: +e.target.value})} />
              <input style={numInputStyle} type="number" value={obsPos.lon} onChange={e => setObsPos({...obsPos, lon: +e.target.value})} />
              <input style={numInputStyle} type="number" value={obsPos.alt} onChange={e => setObsPos({...obsPos, alt: +e.target.value})} />
            </div>

            <button 
              style={{ ...createBtnStyle, backgroundColor: "#28a745" }}
              onClick={async () => {
                if (!selectedSurfaceId) return alert("Please select a surface first!");
                
                const res = await fetch("http://127.0.0.1:8000/analyze", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    lat: obsPos.lat,
                    lon: obsPos.lon,
                    alt: obsPos.alt,
                    surface_id: selectedSurfaceId
                  }),
                });
                
                const result = await res.json();
                if (result.error) return alert(result.error);
                
                // Build the dynamic alert message
                let details = `--- ANALYSIS RESULT ---\n`;
                details += `Status: ${result.penetration ? "❌ VIOLATION" : "✅ CLEAR"}\n`;
                details += `Obstacle Height: ${result.obstacle_alt}m\n\n`;
                
                details += `⚠️ LIMITING SURFACE:\n`;
                details += `${result.limiting_surface}\n`;
                details += `Max Allowed: ${result.allowed_alt}m (Margin: ${result.margin}m)\n\n`;
                
                details += `--- ALL SURFACES ABOVE POINT ---\n`;
                result.all_surfaces.forEach((s: any) => {
                  details += `- ${s.surface_name}: ${s.allowed_alt}m\n`;
                });

                alert(details);
              }}
            >
              Run Analysis
            </button>

            {/* --- PREMIUM: BATCH OBSTACLE UPLOAD --- */}
            <div style={{ backgroundColor: "#e8f0fe", padding: "10px", borderRadius: "4px", marginTop: "15px", border: "1px solid #cce5ff", opacity: user?.is_premium ? 1 : 0.6 }}>
              <label style={{...labelStyle, color: "#1a73e8", display: "block", marginBottom: "8px"}}>
                ★ Premium Feature: Batch Obstacle Analysis
              </label>
              
              <textarea 
                style={{ ...inputStyle, height: "100px", fontFamily: "monospace", fontSize: "12px" }} 
                placeholder={`Crane_1, 51.47, -0.45, 120\nBuilding_A, 51.472, -0.44, 95\n...`}
                value={batchInput}
                onChange={e => setBatchInput(e.target.value)}
                disabled={!user?.is_premium}
              />
              
              <div style={{ ...rowStyle, marginTop: "10px" }}>
                <button 
                  style={{ ...activeTabBtn, backgroundColor: user?.is_premium ? "#1a73e8" : "#ccc", fontSize: "12px" }}
                  disabled={!user?.is_premium}
                  onClick={handleBatchAnalyze}
                >
                  Run Batch Analysis
                </button>
                
                <button 
                  style={{ ...activeTabBtn, backgroundColor: user?.is_premium && batchResults.length > 0 ? "#28a745" : "#ccc", fontSize: "12px" }}
                  disabled={!user?.is_premium || batchResults.length === 0}
                  onClick={downloadBatchCSV}
                >
                  Download Results (.CSV)
                </button>
              </div>

              {!user?.is_premium && (
                <p style={{ color: "red", fontSize: "11px", marginTop: "8px", textAlign: "center" }}>
                  Upgrade to Premium to analyze hundreds of obstacles instantly.
                </p>
              )}
            </div>

            {/* --- PREMIUM EXPORT PANEL --- */}
            {selectedSurfaceId && (
              <div style={{ backgroundColor: "#fff3cd", padding: "10px", borderRadius: "4px", marginBottom: "15px", border: "1px solid #ffeeba" }}>
                <label style={{...labelStyle, color: "#856404", marginBottom: "8px", display: "block"}}>
                  ★ Premium Export Tools
                </label>
                
                <div style={rowStyle}>
                  <button 
                    style={{ ...activeTabBtn, backgroundColor: user?.is_premium ? "#4285F4" : "#ccc", fontSize: "12px" }}
                    disabled={!user?.is_premium}
                    onClick={() => handleExport('kml')}
                  >
                    Download .KML
                  </button>
                  
                  <button 
                    style={{ ...activeTabBtn, backgroundColor: user?.is_premium ? "#d93025" : "#ccc", fontSize: "12px" }}
                    disabled={!user?.is_premium}
                    onClick={() => handleExport('dxf')}
                  >
                    Download .DXF
                  </button>
                </div>
                
                {!user?.is_premium && (
                  <p style={{ color: "red", fontSize: "11px", marginTop: "8px", textAlign: "center" }}>
                    Log in to a Premium account to unlock 3D exports.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- DASHBOARD TAB --- */}
        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
              <label style={{...labelStyle, margin: 0}}>
                My Saved Airspaces
              </label>
              <span style={{ fontSize: "12px", fontWeight: "bold", color: user?.is_premium ? "#28a745" : "#666" }}>
                Storage: {savedSurfaces.length} / {user?.is_premium ? 10 : 1}
              </span>
            </div>

            {!user ? (
              <p style={{ fontSize: "12px", color: "#dc3545", backgroundColor: "#f8d7da", padding: "10px", borderRadius: "4px" }}>
                Please sign in to manage your saved surfaces.
              </p>
            ) : savedSurfaces.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#666", textAlign: "center", padding: "20px" }}>
                You haven't saved any surfaces yet. Go to the Define tab to create one!
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "60vh", overflowY: "auto" }}>
                {savedSurfaces.map(s => (
                  <div key={s.id} style={{ padding: "12px", backgroundColor: "#f8f9fa", border: "1px solid #ddd", borderRadius: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong style={{ fontSize: "13px", color: "#333" }}>{s.name}</strong>
                      <span style={{ fontSize: "10px", backgroundColor: "#e9ecef", padding: "2px 6px", borderRadius: "10px", color: "#555" }}>
                        {s.family}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: "11px", color: "#666", margin: "8px 0" }}>
                      Contains {s.geometry.length} 3D geometric meshes.
                    </div>
                    
                    <div style={rowStyle}>
                      <button 
                        style={{...activeTabBtn, backgroundColor: "#007bff", fontSize: "11px", padding: "6px"}} 
                        onClick={() => handleDrawSurface(s)}
                      >
                        🗺️ Draw on Map
                      </button>
                      <button 
                        style={{...activeTabBtn, backgroundColor: "#dc3545", flex: 0.4, fontSize: "11px", padding: "6px"}} 
                        onClick={() => handleDeleteSurface(s.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!user?.is_premium && savedSurfaces.length >= 1 && (
              <div style={{ backgroundColor: "#fff3cd", padding: "10px", borderRadius: "4px", border: "1px solid #ffeeba", marginTop: "10px" }}>
                <p style={{ color: "#856404", fontSize: "11px", margin: 0, textAlign: "center" }}>
                  <strong>Free Tier Limit Reached.</strong><br/>
                  Upgrade to Premium to save up to 10 distinct airport configurations.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}

// --- STYLES ---
const sidebarStyle: React.CSSProperties = { position: "absolute", top: "20px", left: "20px", width: "350px", padding: "20px", backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", maxHeight: "90vh", overflowY: "auto", zIndex: 10 };
const rowStyle: React.CSSProperties = { display: "flex", gap: "8px" };
const numInputStyle: React.CSSProperties = { flex: 1, minWidth: 0, padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "12px" };
const inputStyle: React.CSSProperties = { padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px", width: "100%" };
const labelStyle: React.CSSProperties = { fontSize: "12px", fontWeight: "bold", color: "#444", marginTop: "5px" };
const activeTabBtn: React.CSSProperties = { flex: 1, padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const inactiveTabBtn: React.CSSProperties = { flex: 1, padding: "10px", backgroundColor: "#ddd", color: "#555", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const createBtnStyle: React.CSSProperties = { marginTop: "15px", padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" };