"use client";
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  // --- STYLES ---
  const sidebarStyle: React.CSSProperties = { position: "absolute", top: "20px", left: "20px", width: "350px", padding: "20px", backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", maxHeight: "90vh", overflowY: "auto", zIndex: 10 };
  const rowStyle: React.CSSProperties = { display: "flex", gap: "8px" };
  const numInputStyle: React.CSSProperties = { flex: 1, minWidth: 0, padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "12px", backgroundColor: "#ffffff" };
  const inputStyle: React.CSSProperties = { padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px", width: "100%", backgroundColor: "#ffffff", color: "#333" };
  const labelStyle: React.CSSProperties = { fontSize: "12px", fontWeight: "bold", color: "#444", marginTop: "5px" };
  const activeTabBtn: React.CSSProperties = { flex: 1, padding: "10px", backgroundColor: "#0b1b3d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
  const inactiveTabBtn: React.CSSProperties = { flex: 1, padding: "10px", backgroundColor: "#ddd", color: "#555", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
  const createBtnStyle: React.CSSProperties = { marginTop: "15px", padding: "12px", backgroundColor: "#0b1b3d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" };
  const [registerEmail, setRegisterEmail] = useState(""); // --- NEW ---
  const [user, setUser] = useState<{id: number, username: string, email?: string, is_premium: boolean, max_airports: number, ion_token: string} | null>(null);
  // YOUR Global Default Token (The one currently in useEffect)
  const DEFAULT_ION_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwOTZmOGMwZC1kNTlkLTRkYWUtYWUxZC0wMzBlOWVlNmM3N2QiLCJpZCI6ODM2NDQsImlhdCI6MTY0NTY5NTMxN30.qUC3Y6wM0_bcbb73TLGH87Azql1ZDX5gM_7relGRRSg';
  const [editIonToken, setEditIonToken] = useState(""); // --- NEW ---
  // --- QUICK TOOLS STATE ---
  const [showTools, setShowTools] = useState(true); // Toggle the widget visibility
  const [activeTool, setActiveTool] = useState<"none" | "ruler" | "point">("none");
  const [toolTip, setToolTip] = useState(""); // Instructions (e.g. "Click Start Point")
  
  // Data for the tools
  const [rulerPts, setRulerPts] = useState<Cesium.Cartesian3[]>([]);
  const [measureResult, setMeasureResult] = useState<{ m: number, nm: number } | null>(null);
  const [pointResult, setPointResult] = useState<{ lat: number, lon: number, alt: number } | null>(null);
  // Dashboard Management State
  const [manageAptSelect, setManageAptSelect] = useState("");
  const [manageAptName, setManageAptName] = useState("");
  const [manageAptPublic, setManageAptPublic] = useState(true);

  // Ref to store tool entities so we can clean them up easily
  const toolsDataSourceRef = useRef<Cesium.CustomDataSource | null>(null);
  // ... inside Home() ...
  const [showGoogleTiles, setShowGoogleTiles] = useState(false); // Checkbox state
  const googleTilesRef = useRef<any>(null); // Memory reference to the tileset
  const [currentOwnerToken, setCurrentOwnerToken] = useState<string | null>(null); // Track if we are using a custom token
  // ... existing states ...
  const [isResending, setIsResending] = useState(false); // UI toggle for Resend View
  const [resendEmailInput, setResendEmailInput] = useState(""); // Input for Resend
  // Loading States for Buttons
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // --- Profile Settings State ---
  const [logStartDate, setLogStartDate] = useState("");
  const [logEndDate, setLogEndDate] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(true); // Default to open so they see they need to login
  const [expandedSurfaceId, setExpandedSurfaceId] = useState<string | null>(null);
  
  // --- Forgot Password State ---
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [registerAsPro, setRegisterAsPro] = useState(false);
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [mounted, setMounted] = useState(false);
  // --- NEW: UI & Redraw States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const drawnSurfacesRef = useRef<any[]>([]);
  // --- Map Display States ---
  const [isGenericMode, setIsGenericMode] = useState(false);
  const [showBuildings, setShowBuildings] = useState(false); // --- NEW ---
  const buildingsRef = useRef<any>(null); // --- NEW ---
  // UI State: "define" or "analyze"
  const [activeTab, setActiveTab] = useState("define");
  const genericColor = Cesium.Color.SLATEGRAY.withAlpha(0.5); // Choose your generic color here
  const [isXRayMode, setIsXRayMode] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  // Map Controls State
  const [exaggeration, setExaggeration] = useState(1);
  const [geoidOffset, setGeoidOffset] = useState(0);
  // --- HELPER: Pick Coordinates from Map ---
  const getCenterFromMap = (setter: React.Dispatch<React.SetStateAction<any>>, currentVal: any) => {
    if (!viewerRef.current) return;
    
    // Temporarily change cursor to crosshair
    viewerRef.current.canvas.style.cursor = "crosshair";
    
    const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
    handler.setInputAction((click: any) => {
      const ray = viewerRef.current?.camera.getPickRay(click.position);
      if (!ray) return;
      
      const cartesian = viewerRef.current?.scene.globe.pick(ray, viewerRef.current.scene);
      if (cartesian) {
        const carto = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = parseFloat(Cesium.Math.toDegrees(carto.latitude).toFixed(6));
        const lon = parseFloat(Cesium.Math.toDegrees(carto.longitude).toFixed(6));
        
        // Use geoid offset if available, otherwise just use 0 or current altitude
        setter({ ...currentVal, lat, lon });
        
        // Clean up and reset cursor
        viewerRef.current!.canvas.style.cursor = "default";
        handler.destroy(); 
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };
  // --- HELPER: Auto-fetch Geoid Offset ---
  const autoFetchGeoidOffset = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`${API_BASE}/geoid-offset?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data.offset !== undefined) {
        setGeoidOffset(data.offset);
        return data.offset;
      }
    } catch (err) {
      console.error("Failed to fetch geoid offset", err);
    }
    return 0;
  };
  // Public Surface Search State
  const [pubSurfQuery, setPubSurfQuery] = useState("");
  const [pubSurfResults, setPubSurfResults] = useState<any[]>([]);
  const [airportName, setAirportName] = useState("");
  // Open Source Data Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState<any[]>([]);
  // RNAV State
  const [rnavMode, setRnavMode] = useState("RNP APCH");
  const [altUnit, setAltUnit] = useState("ft"); // "m" or "ft"
  const [useCustomRnav, setUseCustomRnav] = useState(false);
  
  // Custom Overrides (NM by default for XTT/ATT, Meters for SW?)
  // Let's assume standard units: NM for XTT/ATT, NM or M for SW? 
  // PANS-OPS tables usually give km or NM. Let's use NM to be safe and consistent.
  const [rnavOverrides, setRnavOverrides] = useState({
    if_xtt: 1.0, if_att: 0.8, if_sw: 2.5,
    faf_xtt: 0.3, faf_att: 0.24, faf_sw: 1.45,
    mapt_xtt: 0.3, mapt_att: 0.24, mapt_sw: 0.95
  });
  // Intermediate Fix
  const [ifPos, setIfPos] = useState({ lat: 10.260051, lon: -75.522081, alt: 600 }); 
  // Final Approach Fix
  const [fafPos, setFafPos] = useState({ lat: 10.349778, lon: -75.517365, alt: 1640 });
  // Missed Approach Point
  const [maptPos, setMaptPos] = useState({ lat: 10.430861, lon: -75.513378, alt: 830 });
  // Heliport Specific State
  // --- Heliport Specific State ---
  // --- Heliport Specific State ---
  const [heliPreset, setHeliPreset] = useState("cat_a");

  const [heliParams, setHeliParams] = useState({
    fatoType: "non_instrument", 
    lat: 40.4168, lon: -3.7038, alt: 100,
    bearing: 45,            
    innerWidth: 30,         
    startOffset: 15,
    // Approach Sections (Length, Slope%, Div%)
    appS1Len: 3386, appS1Slope: 4.5, appS1Div: 10.0,
    appS2Len: 0, appS2Slope: 0, appS2Div: 0.0, 
    appS3Len: 0, appS3Slope: 0, appS3Div: 0.0, // --- NEW: Section 3 ---
    // Take-off Sections
    tkofS1Len: 3386, tkofS1Slope: 4.5, tkofS1Div: 10.0,
    tkofS2Len: 0, tkofS2Slope: 0, tkofS2Div: 0.0,
    tkofS3Len: 0, tkofS3Slope: 0, tkofS3Div: 0.0 // --- NEW: Section 3 ---
  });

  const handleHeliPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value;
    setHeliPreset(preset);
    
    // THE FIX: Accurate ICAO Annex 14 Vol II Auto-Fill Rules
    if (preset === "cat_a") { // PC1
      setHeliParams(prev => ({ ...prev, fatoType: "non_instrument", innerWidth: 30, startOffset: 15, appS1Len: 3386, appS1Slope: 4.5, appS1Div: 10, appS2Len: 0, appS2Slope: 0, appS2Div: 0, appS3Len: 0, appS3Slope: 0, appS3Div: 0, tkofS1Len: 3386, tkofS1Slope: 4.5, tkofS1Div: 10, tkofS2Len: 0, tkofS2Slope: 0, tkofS2Div: 0, tkofS3Len: 0, tkofS3Slope: 0, tkofS3Div: 0 }));
    } else if (preset === "cat_b") { // PC3
      setHeliParams(prev => ({ ...prev, fatoType: "non_instrument", innerWidth: 30, startOffset: 15, appS1Len: 245, appS1Slope: 8.0, appS1Div: 10, appS2Len: 830, appS2Slope: 16.0, appS2Div: 0, appS3Len: 0, appS3Slope: 0, appS3Div: 0, tkofS1Len: 245, tkofS1Slope: 8.0, tkofS1Div: 10, tkofS2Len: 830, tkofS2Slope: 16.0, tkofS2Div: 0, tkofS3Len: 0, tkofS3Slope: 0, tkofS3Div: 0 }));
    } else if (preset === "cat_c") { // PC2
      setHeliParams(prev => ({ ...prev, fatoType: "non_instrument", innerWidth: 30, startOffset: 15, appS1Len: 1220, appS1Slope: 12.5, appS1Div: 10, appS2Len: 0, appS2Slope: 0, appS2Div: 0, appS3Len: 0, appS3Slope: 0, appS3Div: 0, tkofS1Len: 1220, tkofS1Slope: 12.5, tkofS1Div: 10, tkofS2Len: 0, tkofS2Slope: 0, tkofS2Div: 0, tkofS3Len: 0, tkofS3Slope: 0, tkofS3Div: 0 }));
    } else if (preset === "non_precision") { // Fixed Instrument Offsets & 3-Section Takeoff
      setHeliParams(prev => ({ ...prev, fatoType: "non_precision", innerWidth: 90, startOffset: 60, appS1Len: 2500, appS1Slope: 3.33, appS1Div: 16, appS2Len: 0, appS2Slope: 0, appS2Div: 0, appS3Len: 0, appS3Slope: 0, appS3Div: 0, tkofS1Len: 2850, tkofS1Slope: 3.5, tkofS1Div: 30, tkofS2Len: 1510, tkofS2Slope: 3.5, tkofS2Div: 0, tkofS3Len: 7640, tkofS3Slope: 2.0, tkofS3Div: 0 }));
    } else if (preset === "precision") {
      setHeliParams(prev => ({ ...prev, fatoType: "precision", innerWidth: 90, startOffset: 60, appS1Len: 3000, appS1Slope: 2.5, appS1Div: 25, appS2Len: 5500, appS2Slope: 3.0, appS2Div: 15, appS3Len: 0, appS3Slope: 0, appS3Div: 0, tkofS1Len: 2850, tkofS1Slope: 3.5, tkofS1Div: 30, tkofS2Len: 1510, tkofS2Slope: 3.5, tkofS2Div: 0, tkofS3Len: 7640, tkofS3Slope: 2.0, tkofS3Div: 0 }));
    }
  };

  const clearTools = () => {
    setActiveTool("none");
    setRulerPts([]);
    setMeasureResult(null);
    setPointResult(null);
    setToolTip("");
    if (toolsDataSourceRef.current) {
        toolsDataSourceRef.current.entities.removeAll();
    }
  };

  // NAVAID specific state
  const [navType, setNavType] = useState("CVOR");
  const [navCoord, setNavCoord] = useState({ lat: 51.47, lon: -0.45, alt: 25 });
  const [navBearing, setNavBearing] = useState(90);
  const [navThr, setNavThr] = useState({ lat: 51.47, lon: -0.42, alt: 25 });
  const isDirectional = ["ILS_LLZ_SF", "ILS_LLZ_DF", "ILS_GP", "MLS_AZ", "MLS_EL", "DME_DIR"].includes(navType);

  // Define State
  const [surfName, setSurfName] = useState("");
  const [family, setFamily] = useState("OLS"); // OLS, OAS, VSS, etc.
  const [t1, setT1] = useState({ lat: 10.430861, lon: -75.513378, alt: 2.13 });
  const [t2, setT2] = useState({ lat: 10.452475, lon: -75.512492, alt: 2.13 });
  const [arpAlt, setArpAlt] = useState(1.22);
  const [runwayType, setRunwayType] = useState("precision");
  // --- Custom OLS State ---
  const [cOls, setCOls] = useState({
    draw_strip: true, strip_end: 60, strip_width: 75,
    draw_app: true, app_div: 15, app_s1_len: 3000, app_s1_slope: 2, app_s2_len: 3600, app_s2_slope: 2.5, app_s3_len: 8400, app_s3_slope: 0,
    draw_dep: true, dep_inner: 180, dep_start: 60, dep_div: 12.5, dep_slope: 2, dep_len: 15000, dep_max_w: 1200,
    draw_trans: true, trans_slope: 14.3,
    draw_ihs: true, ihs_radius: 4000,
    draw_conical: true, conical_slope: 5, conical_height: 100,
    draw_balked: false, balked_start: 1800, balked_slope: 3.33, balked_div: 10,
    draw_in_app: false, in_app_len: 900, in_app_hw: 60, in_app_slope: 2, in_app_offset: 60,
    draw_in_trans: false
  });
  
  // VSS specific state
  const [vssParams, setVssParams] = useState({ stripWidth: 150, oca: 100, descentAngle: 3.0 });
  // OFZ specific state
  const [adg, setAdg] = useState("IV");
  const handleDeleteComponent = async (surfaceId: string, componentName: string) => {
    if (!confirm(`Delete only the "${componentName}" layer?`)) return;

    try {
      // Use query parameter for the component name to handle spaces/special chars safely
      const res = await fetch(`${API_BASE}/surface/${surfaceId}/component?component_name=${encodeURIComponent(componentName)}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const data = await res.json();
        return alert(data.detail || "Failed to delete component");
      }

      // Update Local State without reloading
      setSavedSurfaces(prev => prev.map(s => {
        if (s.id === surfaceId) {
            // Remove the specific geometry from the local cached object
            return {
                ...s,
                geometry: s.geometry.filter((g: any) => g.name !== componentName)
            };
        }
        return s;
      }));
      
    } catch (err) {
      alert("Network error deleting component.");
    }
  };

  // Analyze State
  const [savedSurfaces, setSavedSurfaces] = useState<any[]>([]);
  const [selectedAnalysisAirport, setSelectedAnalysisAirport] = useState("");
  const [selectedAnalysisOwner, setSelectedAnalysisOwner] = useState<number>(0);
  const [obsPos, setObsPos] = useState({ lat: 51.475, lon: -0.44, alt: 50 });
  const [customPoints, setCustomPoints] = useState(""); // Stores "lat,lon,alt" string
  const [isAnalyzingBatch, setIsAnalyzingBatch] = useState(false);

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
          body: JSON.stringify({ 
            username: loginInput, 
            password: passwordInput, 
            email: registerEmail, // --- NEW ---
            is_premium: false 
          })
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

  const handleUpdateProfile = async () => {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        username: editUsername || null,
        email: editEmail || null,
        password: editPassword || null,
        ion_token: editIonToken || null
      })
    });

    const data = await res.json();
    if (!res.ok) return alert(`Update Error: ${data.detail}`);
    
    // Save the brand new token so they don't get logged out
    localStorage.setItem("aero_token", data.access_token);
    alert("Profile updated successfully!");
    window.location.reload();
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

  // Check if user clicked a Password Reset or Verification link
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const rToken = params.get("reset_token");
      if (rToken) setResetToken(rToken);
      
      const vToken = params.get("verify_token");
      if (vToken) {
        fetch(`${API_BASE}/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: vToken })
        }).then(res => res.json()).then(data => {
          alert(data.message || data.detail);
          window.location.href = "/"; // Strip the token from the URL
        });
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("aero_token");
    if (token) {
      fetch(`${API_BASE}/users/me`, { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setUser(data);
            setEditUsername(data.username || "");
            setEditEmail(data.email || "");
            setEditIonToken(data.ion_token || "");
            // Fetch Surfaces
            fetch(`${API_BASE}/get-surfaces`, { headers: { "Authorization": `Bearer ${token}` } })
              .then(r => r.json()).then(surfs => setSavedSurfaces(surfs));
              
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
      
      viewerRef.current.scene.globe.depthTestAgainstTerrain = true; 
    }
  }, [mounted]);

  // --- NEW: Toggle Google Photorealistic 3D Tiles ---
  // --- NEW: Toggle Google Photorealistic 3D Tiles ---
  useEffect(() => {
    const toggleGoogleTiles = async () => {
      if (!viewerRef.current) return;

      if (showGoogleTiles) {
        try {
          // 1. Remove standard OSM buildings if they overlap
          if (buildingsRef.current) {
            viewerRef.current.scene.primitives.remove(buildingsRef.current);
            buildingsRef.current = null;
            setShowBuildings(false); 
          }

          // 2. Load Google 3D Tiles
          const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
          viewerRef.current.scene.primitives.add(tileset);
          googleTilesRef.current = tileset;
          
          // --- FIX: USE THE NEW ".terrain" PROPERTY ---
          // Setting this to undefined makes it a smooth Ellipsoid (WGS84)
          // so it doesn't poke through the Google 3D mesh.
          (viewerRef.current.scene as any).terrain = undefined; 

        } catch (err) {
          alert("Could not load Google 3D Tiles.");
          setShowGoogleTiles(false); 
        }
      } else {
        // Remove the Google tileset
        if (googleTilesRef.current) {
          viewerRef.current.scene.primitives.remove(googleTilesRef.current);
          googleTilesRef.current = null;
        }

        // --- FIX: RESTORE WORLD TERRAIN USING ".terrain" ---
        (viewerRef.current.scene as any).terrain = Cesium.Terrain.fromWorldTerrain();
      }
    };

    toggleGoogleTiles();
  }, [showGoogleTiles]);

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

  // --- NEW: Toggle 3D Buildings ---
  useEffect(() => {
    const toggleBuildings = async () => {
      if (!viewerRef.current) return;
      
      // If checked and we haven't downloaded them yet
      if (showBuildings && !buildingsRef.current) {
        try {
          const buildings = await Cesium.createOsmBuildingsAsync();
          if (viewerRef.current) {
            viewerRef.current.scene.primitives.add(buildings);
            buildingsRef.current = buildings; // Save to memory!
          }
        } catch (err) {
          console.error("Could not load 3D buildings", err);
        }
      } 
      // If they are already in memory, just flip the visibility switch instantly
      else if (buildingsRef.current) {
        buildingsRef.current.show = showBuildings;
      }
    };
    
    toggleBuildings();
  }, [showBuildings]);

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
  // Handle KML/DXF File Upload for Premium Users
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt") || name.endsWith(".csv")) {
        // Legacy local read for CSV/TXT
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setCustomPoints(text);
        };
        reader.readAsText(file);
        return;
    }

    // New Server-Side Import for KML/DXF
    if (name.endsWith(".kml") || name.endsWith(".dxf")) {
        const formData = new FormData();
        formData.append("file", file);

        setIsCreating(true); // Reuse loading state
        try {
            const res = await fetch(`${API_BASE}/import/geometry`, {
                method: "POST",
                headers: {
                    // Do NOT set Content-Type header manually for FormData, 
                    // browser does it automatically with boundary!
                    "Authorization": getAuthHeaders()["Authorization"] || ""
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Import failed");

            setCustomPoints(data.result); // Populate the text area!
            alert("File imported! Please review coordinates in the text box before creating.");
            
        } catch (err: any) {
            alert(`Import Error: ${err.message}`);
        } finally {
            setIsCreating(false);
        }
    }
  };

  // --- BATCH FILE UPLOAD HELPER ---
  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        setBatchInput(text); // Automatically dumps file content into the textarea
    };
    reader.readAsText(file);
  };

  // --- BATCH ANALYSIS LOGIC ---
  // --- BATCH ANALYSIS LOGIC ---
  const handleBatchAnalyze = async () => {
    if (!selectedAnalysisAirport) return alert("Please select a target airport first!");
    
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

    setIsAnalyzingBatch(true); // --- START LOADING ---
    try {
      const res = await fetch(`${API_BASE}/analyze-batch`, {
        method: "POST",
        headers: getAuthHeaders(),
        // THE FIX: Send the keys that match our new Pydantic Model!
        body: JSON.stringify({ 
            airport_name: selectedAnalysisAirport, 
            owner_id: selectedAnalysisOwner, 
            obstacles: obsList 
        }),
      });
      
      const data = await res.json();
      if (data.error) return alert(data.error);

      setBatchResults(data.results);

      // --- DRAW RESULTS ON MAP ---
      if (viewerRef.current) {
        const entitiesToRemove: Cesium.Entity[] = [];
        viewerRef.current.entities.values.forEach(e => {
          if (e.id && e.id.toString().startsWith('batch-obs-')) entitiesToRemove.push(e);
        });
        entitiesToRemove.forEach(e => viewerRef.current?.entities.remove(e));

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
            polyline: { 
              positions: Cesium.Cartesian3.fromDegreesArrayHeights([res.lon, res.lat, 0, res.lon, res.lat, res.alt]),
              width: 2,
              material: color.withAlpha(0.6)
            }
          });
        });
      }
    } catch (err) {
      alert("Network error processing batch.");
    } finally {
      setIsAnalyzingBatch(false); // --- STOP LOADING ---
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

  const generateBatchPDF = () => {
    if (!batchResults || batchResults.length === 0) return;
    
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    // --- 1. REPORT HEADER ---
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102); // Navy Blue
    doc.text("BATCH OBSTACLE EVALUATION REPORT", 105, 20, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);

    // Calculate Summary Stats
    const totalCount = batchResults.length;
    const penetrationsCount = batchResults.filter(r => r.penetration).length;

    // --- 2. METADATA SECTION ---
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date of Analysis: ${date}`, 14, 35);
    doc.text(`Evaluated Airspace: ${selectedAnalysisAirport}`, 14, 42);
    doc.text(`Total Obstacles Evaluated: ${totalCount}`, 14, 49);
    
    if (penetrationsCount > 0) {
        doc.setTextColor(200, 0, 0); // Red
        doc.text(`Total Violations Detected: ${penetrationsCount}`, 14, 56);
    } else {
        doc.setTextColor(0, 150, 0); // Green
        doc.text(`Total Violations Detected: 0 (All Clear)`, 14, 56);
    }

    // --- 3. AUTO-TABLE (Handles multi-page breaks automatically!) ---
    autoTable(doc, {
      startY: 65,
      headStyles: { fillColor: [0, 51, 102], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      head: [['ID', 'Lat', 'Lon', 'Prop. Height', 'Limiting Surface', 'Max Allowed', 'Margin', 'Violation']],
      body: batchResults.map((r: any) => [
        r.id,
        parseFloat(r.lat).toFixed(5),
        parseFloat(r.lon).toFixed(5),
        `${parseFloat(r.alt).toFixed(2)} m`,
        r.limiting_surface || "None",
        r.allowed_alt !== null ? `${parseFloat(r.allowed_alt).toFixed(2)} m` : "N/A",
        r.margin !== null ? `${parseFloat(r.margin).toFixed(2)} m` : "N/A",
        r.penetration ? "YES" : "NO"
      ]),
      // Color-code the "YES" / "NO" column
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 7) {
          if (data.cell.raw === "YES") {
            data.cell.styles.textColor = [200, 0, 0];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [0, 150, 0];
          }
        }
      }
    });

    // --- 4. FOOTER DISCLAIMER ---
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount} - Automated analysis report. Verify with local Civil Aviation Authorities.`, 105, pageHeight - 10, { align: "center" });
    }

    // --- 5. TRIGGER DOWNLOAD ---
    doc.save(`AeroCheck_Batch_Report_${selectedAnalysisAirport.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  // --- DATABASE SEARCH LOGIC ---
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    let url = `${API_BASE}/search/airports?q=${query}`;
    if (family === "NAVAID") url = `${API_BASE}/search/navaids?q=${query}`;
    if (family === "HELIPORT") url = `${API_BASE}/search/airports?q=${query}&is_heliport=true`; // THE FIX
    
    const res = await fetch(url);
    const data = await res.json();
    setSearchResults(data);
    setIsSearching(false);
  };

  const handleSelectRunway = async (airport: any, runway?: any) => {
    // OurAirports uses feet. We MUST convert to meters (1 ft = 0.3048 m)
    const ftToM = 0.3048;
    const arpAltM = (Number(airport.alt_ft) || 0) * ftToM;
    const finalArpAlt = Number(arpAltM.toFixed(2));
    
    setArpAlt(finalArpAlt);
    
    let centerLat: number;
    let centerLon: number;

    // CASE 1: A specific runway is selected (Standard Aeroplane OLS/OFZ)
    if (runway) {
      setSurfName(`${airport.ident} - RWY ${runway.le_ident}/${runway.he_ident}`);
      
      centerLat = Number(runway.le_latitude_deg);
      centerLon = Number(runway.le_longitude_deg);

      setT1({
        lat: centerLat,
        lon: centerLon,
        alt: Number(((Number(runway.le_elevation_ft) || Number(airport.alt_ft) || 0) * ftToM).toFixed(2))
      });
      
      setT2({
        lat: Number(runway.he_latitude_deg),
        lon: Number(runway.he_longitude_deg),
        alt: Number(((Number(runway.he_elevation_ft) || Number(airport.alt_ft) || 0) * ftToM).toFixed(2))
      });
    } 
    // CASE 2: No runway exists (Heliports / NAVAIDs using base facility coordinates)
    else {
      setSurfName(`${airport.ident} - Base Facility`);
      
      centerLat = Number(airport.lat) || 0;
      centerLon = Number(airport.lon) || 0;

      setT1({ lat: centerLat, lon: centerLon, alt: finalArpAlt });
      setT2({ lat: centerLat, lon: centerLon, alt: finalArpAlt });
    }

    // --- THE FIX: Sync coordinates to Heliport & NAVAID parameters using proper state names ---
    setHeliParams(prev => ({ ...prev, lat: centerLat, lon: centerLon, alt: finalArpAlt }));
    setNavCoord(prev => ({ ...prev, lat: centerLat, lon: centerLon, alt: finalArpAlt }));
    setNavThr(prev => ({ ...prev, lat: centerLat, lon: centerLon, alt: finalArpAlt }));

    setSearchResults([]);
    setSearchQuery(""); // Clears the search box

    // Auto-calculate offset based on the resolved Lat/Lon
    await autoFetchGeoidOffset(centerLat, centerLon);
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

    // FIXED: Point to the correct endpoint AND include the auth headers so Supabase knows who is deleting it!
    const res = await fetch(`${API_BASE}/delete-surface/${surfaceId}`, {
      method: "DELETE",
      headers: getAuthHeaders() 
    });
    
    const data = await res.json();
    if (!res.ok || data.error) return alert(data.error || "Failed to delete from database");
    
    // Remove from UI state
    setSavedSurfaces(prev => prev.filter(s => s.id !== surfaceId));
  };

  // --- THE FIX: Add explicitOffset parameter ---
  const handleDrawSurface = (surfaceInput: any | any[], explicitOffset?: number, shouldZoom: boolean = true) => {
    if (!viewerRef.current) return;
    
    const surfaces = Array.isArray(surfaceInput) ? surfaceInput : [surfaceInput];
    drawnSurfacesRef.current = surfaces;

    viewerRef.current.entities.removeAll();
    const entitiesToAdd: Cesium.Entity[] = [];

    const appliedOffset = explicitOffset !== undefined ? explicitOffset : geoidOffset;

    surfaces.forEach(surface => {
        if (surface.geometry) {
            surface.geometry.forEach((geo: any) => {
                
                // --- THE FIX: Support grouped Quad-Lists (e.g., Conical) ---
                if (geo.quads) {
                    geo.quads.forEach((quadCoords: number[]) => {
                        const adjustedCoords = [...quadCoords];
                        for (let i = 2; i < adjustedCoords.length; i += 3) {
                            adjustedCoords[i] = (adjustedCoords[i] + appliedOffset) * exaggeration;
                        }
                        const entity = viewerRef.current?.entities.add({
                            name: geo.name, // They all share the same name!
                            polygon: {
                                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(adjustedCoords), 
                                perPositionHeight: true, 
                                material: isGenericMode ? genericColor : Cesium.Color.fromCssColorString(geo.color).withAlpha(0.4),
                                outline: true,
                                outlineColor: Cesium.Color.BLACK
                            }
                        });
                        if (entity) entitiesToAdd.push(entity);
                    });
                } 
                // --- Standard Single-Polygon Processing ---
                else if (geo.coords) {
                    const adjustedCoords = [...geo.coords];
                    for (let i = 2; i < adjustedCoords.length; i += 3) {
                        adjustedCoords[i] = (adjustedCoords[i] + appliedOffset) * exaggeration;
                    }
                    const entity = viewerRef.current?.entities.add({
                        name: geo.name,
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(adjustedCoords), 
                            perPositionHeight: true, 
                            material: isGenericMode ? genericColor : Cesium.Color.fromCssColorString(geo.color).withAlpha(0.4),
                            outline: true,
                            outlineColor: Cesium.Color.BLACK
                        }
                    });
                    if (entity) entitiesToAdd.push(entity);
                }
            });
        }
    });

    // --- THE FIX: Only zoom if shouldZoom is true ---
    if (shouldZoom && entitiesToAdd.length > 0) {
        viewerRef.current.zoomTo(entitiesToAdd, new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(0), 
            Cesium.Math.toRadians(-45), 
            5000 
        ));
    }
  };

  // --- NEW: Watch for Generic Mode Toggles ---
  useEffect(() => {
    if (drawnSurfacesRef.current.length > 0) {
        // Explicitly pass the current state offset
        handleDrawSurface(drawnSurfacesRef.current, geoidOffset); 
    }
  }, [isGenericMode]);

  // --- TOOL INTERACTION HANDLER ---
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    // Create a data source for our tool drawings if it doesn't exist
    if (!toolsDataSourceRef.current) {
      const ds = new Cesium.CustomDataSource("tools");
      viewer.dataSources.add(ds);
      toolsDataSourceRef.current = ds;
    }
    const toolsLayer = toolsDataSourceRef.current;

    // Setup Click Handler
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click: any) => {
      if (activeTool === "none") return;

      // 1. Get Earth Coordinates
      // We try to pick the 3D Tiles/Terrain first, then fallback to Ellipsoid
      // 1. Get Earth Coordinates
      const ray = viewer.camera.getPickRay(click.position);
      
      // --- FIX: Guard against undefined ray ---
      if (!ray) return; 

      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;

      // --- POINT TOOL ---
      if (activeTool === "point") {
        toolsLayer.entities.removeAll(); // Clear previous
        
        // Convert to Lat/Lon
        const carto = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = parseFloat(Cesium.Math.toDegrees(carto.latitude).toFixed(5));
        const lon = parseFloat(Cesium.Math.toDegrees(carto.longitude).toFixed(5));
        const alt = parseFloat(carto.height.toFixed(1));

        // Draw Dot
        toolsLayer.entities.add({
          position: cartesian,
          point: { pixelSize: 10, color: Cesium.Color.CYAN, outlineColor: Cesium.Color.BLACK, outlineWidth: 2 },
          label: {
            text: `Lat: ${lat}\nLon: ${lon}\nAlt: ${alt}m`,
            showBackground: true,
            font: "14px monospace",
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(10, -10),
            disableDepthTestDistance: Number.POSITIVE_INFINITY // Always on top
          }
        });

        setPointResult({ lat, lon, alt });
      }

      // --- RULER TOOL ---
      if (activeTool === "ruler") {
        const newPts = [...rulerPts, cartesian];
        
        // Draw the point
        toolsLayer.entities.add({
            position: cartesian,
            point: { pixelSize: 8, color: Cesium.Color.YELLOW, outlineColor: Cesium.Color.BLACK, outlineWidth: 2 }
        });

        if (newPts.length === 1) {
            setToolTip("Click End Point");
            setRulerPts(newPts);
        } else if (newPts.length === 2) {
            // Draw Line
            toolsLayer.entities.add({
                polyline: {
                    positions: newPts,
                    width: 3,
                    material: Cesium.Color.YELLOW,
                    depthFailMaterial: Cesium.Color.YELLOW // See through terrain
                }
            });

            // Calculate Distance
            const distM = Cesium.Cartesian3.distance(newPts[0], newPts[1]);
            const distNM = distM / 1852.0;
            
            setMeasureResult({ m: parseFloat(distM.toFixed(1)), nm: parseFloat(distNM.toFixed(2)) });
            setToolTip("Distance Measured. Click 'Reset' to start over.");
            setRulerPts(newPts); // Lock it
            
            // Add Label at midpoint
            const midpoint = Cesium.Cartesian3.lerp(newPts[0], newPts[1], 0.5, new Cesium.Cartesian3());
            toolsLayer.entities.add({
                position: midpoint,
                label: {
                    text: `${(distM/1000).toFixed(2)} km\n${distNM.toFixed(2)} NM`,
                    showBackground: true,
                    font: "bold 14px sans-serif",
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
            });
        }
      }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Cleanup when tool changes
    return () => {
      handler.destroy();
    };
  }, [activeTool, rulerPts]); // Re-bind when state changes

  // --- PUBLIC SURFACE SEARCH LOGIC ---
  const handleSearchPublicSurfaces = async (query: string) => {
    setPubSurfQuery(query);
    try {
        const res = await fetch(`${API_BASE}/search/public-surfaces?q=${query}`);
        if (res.ok) {
            const data = await res.json();
            setPubSurfResults(data); // Removed the slice, the backend now limits to 10 safely
        }
    } catch (err) {
        console.error("Search failed", err);
    }
  };

  const handleExport = async (format: 'kml' | 'dxf') => {
    // FIXED: Dynamically use the 'format' variable in the URL
    const res = await fetch(`${API_BASE}/export/${format}?airport_name=${encodeURIComponent(selectedAnalysisAirport)}`, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const err = await res.json();
      return alert(`Export Error: ${err.detail}`);
    }
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedAnalysisAirport.replace(/\s+/g, '_')}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const handleDownloadLogs = async () => {
    if (!logStartDate || !logEndDate) return alert("Please select both a start and end date.");
    if (new Date(logStartDate) > new Date(logEndDate)) return alert("Start date cannot be after end date.");

    const res = await fetch(`${API_BASE}/export/audit-logs?start_date=${logStartDate}&end_date=${logEndDate}`, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const err = await res.json();
      return alert(`Export Error: ${err.detail}`);
    }
    
    // Trigger the silent file download
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `AeroCheck_Logs_${logStartDate}_to_${logEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- OFFICIAL PDF GENERATOR ---
  const generatePDF = () => {
    if (!analysisResult) return;
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    let currentY = 20; // This tracks where we are on the page vertically

    // --- 1. DYNAMIC LOGO INJECTION ---
    if (analysisResult.authority_logo) {
      try {
        // Create an invisible image element to read its true, unsquished dimensions
        const img = new window.Image();
        img.src = analysisResult.authority_logo;

        // Default dimensions just in case
        let imgWidth = 20; 
        let imgHeight = 20; 

        // If the browser successfully reads the image shape, calculate the perfect aspect ratio
        if (img.width && img.height) {
          imgHeight = 20; // We lock the height to 20mm
          imgWidth = imgHeight * (img.width / img.height); // Dynamically scale the width!
        }

        const imageType = analysisResult.authority_logo.includes("jpeg") || analysisResult.authority_logo.includes("jpg") ? "JPEG" : "PNG";
        
        doc.addImage(analysisResult.authority_logo, imageType, 14, 10, imgWidth, imgHeight);

        // Push the title down below the logo!
        currentY = 40; 
      } catch (err) {
        console.warn("Failed to load Authority Logo into PDF", err);
      }
    }

    // --- 2. REPORT HEADER ---
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102); // Navy Blue
    // The text is back to being perfectly centered, but pushed down if a logo exists
    doc.text("AERONAUTICAL OBSTACLE EVALUATION REPORT", 105, currentY, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(14, currentY + 5, 196, currentY + 5);

    // --- 3. METADATA SECTION ---
    currentY += 15;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date of Analysis: ${date}`, 14, currentY);
    doc.text(`Authority / Defined By: ${analysisResult.authority_name}`, 14, currentY + 7);
    doc.text(`Evaluated Airspace: ${analysisResult.surface_name}`, 14, currentY + 14);

    // --- 4. OBSTACLE DETAILS ---
    currentY += 25;
    doc.setFont("helvetica", "bold");
    doc.text("Obstacle Details:", 14, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`Latitude:  ${obsPos.lat}°`, 20, currentY + 7);
    doc.text(`Longitude: ${obsPos.lon}°`, 20, currentY + 14);
    doc.text(`Proposed Height: ${analysisResult.obstacle_alt} m`, 20, currentY + 21);

    // --- 5. OFFICIAL DETERMINATION ---
    currentY += 35;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    if (analysisResult.penetration) {
      doc.setTextColor(200, 0, 0); // Red
      doc.text(`DETERMINATION: DENIED (PENETRATES SURFACES)`, 14, currentY);
    } else {
      doc.setTextColor(0, 150, 0); // Green
      doc.text(`DETERMINATION: ALLOWED (CLEAR OF SURFACES)`, 14, currentY);
    }

    // --- 6. ANALYSIS BREAKDOWN TABLE ---
    currentY += 10;
    autoTable(doc, {
      startY: currentY,
      headStyles: { fillColor: [0, 51, 102] },
      head: [['Evaluated Surface', 'Allowed Max Height (m)', 'Margin to Obstacle (m)']],
      body: analysisResult.all_surfaces.map((s: any) => [
        s.surface_name,
        s.allowed_alt,
        (s.allowed_alt - analysisResult.obstacle_alt).toFixed(2)
      ]),
    });

    // --- 7. FOOTER DISCLAIMER ---
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("This document is an automated analysis report. Please verify with local Civil Aviation Authorities.", 105, pageHeight - 10, { align: "center" });

    // --- 8. TRIGGER DOWNLOAD ---
    // --- NEW: SAVE TO AUDIT LOG (Fire and Forget) ---
    if (user?.is_premium) {
      fetch(`${API_BASE}/audit-log`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          airport_name: selectedAnalysisAirport,
          owner_id: selectedAnalysisOwner,
          lat: obsPos.lat,
          lon: obsPos.lon,
          alt: obsPos.alt,
          limiting_surface: analysisResult.limiting_surface,
          margin: analysisResult.margin,
          penetration: analysisResult.penetration
        })
      }).catch(err => console.error("Failed to save audit log", err));
    }
    doc.save(`AeroCheck_Report_${Date.now()}.pdf`);
  };

 const handleDefine = async () => {
    let bodyData: any = {
        airport_name: airportName,
        name: surfName,
        surface_family: family,
        runway_type: runwayType,
        t1, t2, arp_alt: arpAlt,
        vss_params: family === "VSS" ? vssParams : null,
        adg: family === "OFZ" ? adg : null,
        rnav_params: family === "RNAV" ? {
        mode: rnavMode,
        alt_unit: altUnit,
        if_lat: ifPos.lat, if_lon: ifPos.lon,
        faf_lat: fafPos.lat, faf_lon: fafPos.lon, faf_alt: fafPos.alt,
        mapt_lat: maptPos.lat, mapt_lon: maptPos.lon, mapt_alt: maptPos.alt,
        
        use_custom_values: useCustomRnav,
        if_xtt: rnavOverrides.if_xtt, if_att: rnavOverrides.if_att, if_sw: rnavOverrides.if_sw,
        faf_xtt: rnavOverrides.faf_xtt, faf_att: rnavOverrides.faf_att, faf_sw: rnavOverrides.faf_sw,
        mapt_xtt: rnavOverrides.mapt_xtt, mapt_att: rnavOverrides.mapt_att, mapt_sw: rnavOverrides.mapt_sw,
    } : null,
        navaid_params: family === "NAVAID" ? {
            n_type: navType,
            lat: navCoord.lat,
            lon: navCoord.lon,
            alt: navCoord.alt,
            bearing: navBearing,
            thr_lat: navThr.lat,
            thr_lon: navThr.lon,
            thr_alt: navThr.alt
        } : null,
    heliport_params: family === "HELIPORT" ? {
            fato_type: heliParams.fatoType,
            lat: heliParams.lat, lon: heliParams.lon, alt: heliParams.alt,
            bearing: heliParams.bearing, 
            inner_width: heliParams.innerWidth, start_offset: heliParams.startOffset, 
            approach_sections: [
                { length: heliParams.appS1Len, slope_pct: heliParams.appS1Slope, divergence_pct: heliParams.appS1Div },
                { length: heliParams.appS2Len, slope_pct: heliParams.appS2Slope, divergence_pct: heliParams.appS2Div },
                { length: heliParams.appS3Len, slope_pct: heliParams.appS3Slope, divergence_pct: heliParams.appS3Div }
            ].filter(s => s.length > 0),
            takeoff_sections: [
                { length: heliParams.tkofS1Len, slope_pct: heliParams.tkofS1Slope, divergence_pct: heliParams.tkofS1Div },
                { length: heliParams.tkofS2Len, slope_pct: heliParams.tkofS2Slope, divergence_pct: heliParams.tkofS2Div },
                { length: heliParams.tkofS3Len, slope_pct: heliParams.tkofS3Slope, divergence_pct: heliParams.tkofS3Div }
            ].filter(s => s.length > 0)
        } : null,
        custom_coords: family === "CUSTOM" ? customPoints : undefined,
            // --- NEW: Custom OLS Payload Mapper ---
            custom_ols_params: runwayType === "custom" ? {
                draw_strip: cOls.draw_strip, draw_approach: cOls.draw_app, draw_departure: cOls.draw_dep,
                draw_transitional: cOls.draw_trans, draw_ihs: cOls.draw_ihs, draw_conical: cOls.draw_conical,
                draw_balked: cOls.draw_balked, draw_inner_approach: cOls.draw_in_app, draw_inner_transitional: cOls.draw_in_trans,
                strip_end: cOls.strip_end, strip_width: cOls.strip_width, ihs_radius: cOls.ihs_radius,
                app_div: cOls.app_div / 100, 
                app_sections: [
                    { len: cOls.app_s1_len, slope: cOls.app_s1_slope / 100 },
                    { len: cOls.app_s2_len, slope: cOls.app_s2_slope / 100 },
                    { len: cOls.app_s3_len, slope: cOls.app_s3_slope / 100 }
                ].filter(s => s.len > 0), // Ignore 0-length sections
                trans_slope: cOls.trans_slope / 100,
                dep_inner: cOls.dep_inner, dep_start: cOls.dep_start, dep_div: cOls.dep_div / 100,
                dep_slope: cOls.dep_slope / 100, dep_len: cOls.dep_len, dep_max_w: cOls.dep_max_w,
                conical_slope: cOls.conical_slope / 100, conical_height: cOls.conical_height,
                balked_start: cOls.balked_start, balked_slope: cOls.balked_slope / 100, balked_div: cOls.balked_div / 100,
                inner_app_len: cOls.in_app_len, inner_app_hw: cOls.in_app_hw, inner_app_slope: cOls.in_app_slope / 100, inner_app_offset: cOls.in_app_offset
            } : undefined
    };
    if (family === "CUSTOM") {
            const lines = customPoints.split("\n");
            const coords: any[] = [];
            
            lines.forEach(line => {
                // Remove whitespace and ignore empty lines
                const cleanLine = line.trim();
                if (!cleanLine) return;

                const parts = cleanLine.split(",").map(s => s.trim());
                
                // VALIDATION: We need at least Name + 1 point (4 parts)
                // And the remaining parts must be multiples of 3 (Lat, Lon, Alt)
                if (parts.length < 4 || (parts.length - 1) % 3 !== 0) {
                    console.warn(`Skipping invalid line: ${line}`);
                    return;
                }

                const surfaceId = parts[0]; // First item is the Name
                
                // Loop through the rest in chunks of 3
                for (let i = 1; i < parts.length; i += 3) {
                    coords.push({ 
                        id: surfaceId, 
                        lat: parseFloat(parts[i]), 
                        lon: parseFloat(parts[i+1]), 
                        alt: parseFloat(parts[i+2]) 
                    });
                }
            });

            if (coords.length < 3) return alert("Please enter at least 3 points for a valid polygon.");
            
            bodyData = { ...bodyData, custom_coords: coords };
      }
    setIsCreating(true); // START LOADING
    try {
      const res = await fetch(`${API_BASE}/create-surface`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (data.error) return alert(data.error); // Catch DB limits
      
      if (viewerRef.current && data.geometry) {
          // 1. Fetch EGM96 offset
          let newOffset = geoidOffset;
          if (data.geometry.length > 0 && data.geometry[0].coords.length >= 2) {
              const coords = data.geometry[0].coords;
              newOffset = await autoFetchGeoidOffset(coords[1], coords[0]);
          }

          // 2. Let our master function draw it, apply the offset, and zoom the camera!
          handleDrawSurface([data], newOffset);

          // 3. Save to memory
          if (!user || !user.is_premium) {
              setSavedSurfaces([data]);
              setSelectedAnalysisAirport(data.airport_name);
              setSelectedAnalysisOwner(0);
          } else {
              setSavedSurfaces(prev => [...prev, data]);
          }
      }
    } catch (error) {
    alert("An error occurred while creating the surface.");
    } finally {
        setIsCreating(false); // STOP LOADING (Always runs)
    }
  };

  if (!mounted) return <div style={{ backgroundColor: "#111", height: "100vh" }} />;
    if (resetToken) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f8f9fa", fontFamily: "sans-serif" }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", width: "350px", textAlign: "center" }}>
            <h3 style={{ color: "#0b1b3d", marginTop: 0 }}>Reset Your Password</h3>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "20px" }}>Enter a new secure password for your Altitude Nexus account.</p>
            
            <input 
              type="password" 
              style={{...inputStyle, marginBottom: "15px"}} 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              placeholder="New Password" 
            />
            
            <button 
              style={{...activeTabBtn, width: "100%", padding: "12px", backgroundColor: "#28a745"}} 
              onClick={async () => {
                if (!newPassword) return alert("Please enter a new password");
                
                const res = await fetch(`${API_BASE}/reset-password`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ token: resetToken, new_password: newPassword })
                });
                
                const data = await res.json();
                if (!res.ok) return alert(`Error: ${data.detail}`);
                
                alert("Password updated successfully! You can now log in.");
                window.location.href = "/"; // Send them back to the main app to log in natively
              }}
            >
              Save New Password
            </button>
          </div>
        </div>
      );
    }

    return (
      <main style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
        {/* CESIUM MAP CONTAINER */}
        <div ref={cesiumContainer} style={{ width: "100%", height: "100%" }} />

        {/* --- NEW: ALTITUDE NEXUS BRANDING LINK --- */}
          <a 
              href="https://www.altitudenexus.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                  position: "absolute",
                  bottom: "5px",
                  left: "5px",
                  backgroundColor: "#0b1b3d", 
                  color: "#ffffff",
                  padding: "10px 130px",
                  borderRadius: "4px",
                  fontWeight: "900",
                  letterSpacing: "3px",
                  fontSize: "16px",
                  zIndex: 10,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                  textDecoration: "none", // Keeps it looking like a box instead of a blue link
                  cursor: "pointer",
                  pointerEvents: "auto" // FIXED: Allows the user to click it!
              }}
          >
              ALTITUDE NEXUS
          </a>

          {/* --- QUICK TOOLS WIDGET (TOP RIGHT) --- */}
      <div style={{
        position: "absolute",
        top: "50px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end", // Align to right
        gap: "10px",
        zIndex: 90 // Above map
      }}>
        
        {/* Toggle Button (Small Icon) */}
        <button 
          onClick={() => setShowTools(!showTools)}
          style={{
            width: "40px", height: "40px", borderRadius: "50%",
            backgroundColor: "white", border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center"
          }}
          title="Toggle Tools"
        >
          {showTools ? "✕" : "🛠️"}
        </button>

        {/* The Tool Panel */}
        {showTools && (
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "15px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            width: "220px", display: "flex", flexDirection: "column", gap: "10px"
          }}>
            <strong style={{fontSize: "12px", color: "#555", textTransform: "uppercase"}}>Quick Tools</strong>
            
            {/* Tool Buttons */}
            <div style={{display: "flex", gap: "5px"}}>
                <button 
                    style={{
                        flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc",
                        backgroundColor: activeTool === "ruler" ? "#0b1b3d" : "white",
                        color: activeTool === "ruler" ? "white" : "#333",
                        cursor: "pointer", fontSize: "12px", fontWeight: "bold"
                    }}
                    onClick={() => {
                        clearTools();
                        setActiveTool("ruler");
                        setToolTip("Click Start Point");
                    }}
                >
                    📏 Ruler
                </button>
                <button 
                    style={{
                        flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc",
                        backgroundColor: activeTool === "point" ? "#0b1b3d" : "white",
                        color: activeTool === "point" ? "white" : "#333",
                        cursor: "pointer", fontSize: "12px", fontWeight: "bold"
                    }}
                    onClick={() => {
                        clearTools();
                        setActiveTool("point");
                        setToolTip("Click any point");
                    }}
                >
                    📍 Point
                </button>
            </div>

            {/* Instructions / Status */}
            {activeTool !== "none" && (
                <div style={{fontSize: "11px", color: "#666", fontStyle: "italic", textAlign: "center"}}>
                    {toolTip}
                </div>
            )}

            {/* Results Display */}
            {activeTool === "ruler" && measureResult && (
                <div style={{backgroundColor: "#f0f8ff", padding: "8px", borderRadius: "4px", fontSize: "12px", border: "1px solid #bde0fe"}}>
                    <div><strong>Dist (m):</strong> {measureResult.m.toLocaleString()} m</div>
                    <div><strong>Dist (NM):</strong> {measureResult.nm.toLocaleString()} NM</div>
                </div>
            )}

            {activeTool === "point" && pointResult && (
                <div style={{backgroundColor: "#f0f8ff", padding: "8px", borderRadius: "4px", fontSize: "12px", border: "1px solid #bde0fe"}}>
                    <div><strong>Lat:</strong> {pointResult.lat}</div>
                    <div><strong>Lon:</strong> {pointResult.lon}</div>
                    <div><strong>Alt:</strong> {pointResult.alt} m</div>
                </div>
            )}

            {/* Clear Button */}
            {activeTool !== "none" && (
                <button 
                    onClick={clearTools}
                    style={{
                        padding: "5px", backgroundColor: "#e74c3c", color: "white", border: "none", 
                        borderRadius: "4px", cursor: "pointer", fontSize: "11px"
                    }}
                >
                    Clear / Stop
                </button>
            )}
          </div>
        )}
      </div>

        {/* --- NEW: SIDEBAR TOGGLE ARROW --- */}
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
                position: "absolute",
                top: "20px",
                left: isSidebarOpen ? "380px" : "0px", // Slides with the menu
                zIndex: 20,
                width: "35px",
                height: "45px",
                backgroundColor: "rgba(255,255,255,0.95)",
                color: "#0b1b3d",
                border: "none",
                borderRadius: "0 8px 8px 0", // Rounded on the right side
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "4px 0px 10px rgba(0,0,0,0.1)",
                transition: "left 0.3s ease-in-out",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            {isSidebarOpen ? "◀" : "▶"}
        </button>

          {/* SINGLE INTERACTIVE SIDEBAR */}
          <div style={{ 
              ...sidebarStyle, 
              left: isSidebarOpen ? "20px" : "-400px", 
              transition: "left 0.3s ease-in-out" 
          }}>
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
              {/* --- NEW: 3D Buildings Checkbox --- */}
              <label 
                style={{ 
                  fontSize: "12px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "5px", 
                  // Grey out text if not premium
                  color: user?.is_premium ? "#333" : "#999", 
                  // Show "not-allowed" circle cursor for free users
                  cursor: user?.is_premium ? "pointer" : "not-allowed" 
                }}
                title={!user?.is_premium ? "Upgrade to Premium to view 3D buildings" : ""}
              >
                <input 
                  type="checkbox" 
                  checked={showBuildings} 
                  onChange={e => setShowBuildings(e.target.checked)} 
                  // Physically disable the box for free users
                  disabled={!user?.is_premium} 
                />
                Show 3D Buildings {!user?.is_premium && <span style={{color: "gold"}}>★</span>}
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
                {/* --- OPEN SOURCE SEARCH --- */}
                <div style={{ backgroundColor: "#e8f0fe", padding: "10px", borderRadius: "4px", border: "1px solid #cce5ff", position: "relative" }}>{/* --- , opacity: user?.is_premium ? 1 : 0.6, --- */}
                  
                  <input 
                    style={inputStyle} 
                    value={searchQuery} 
                    onChange={e => handleSearch(e.target.value)} 
                    placeholder={family === "NAVAID" ? "Search Navaid (e.g. JFK or Kennedy)" : "Search Airport ICAO or Name (e.g. EGLL or Heathrow)"}
                    onBlur={() => setTimeout(() => {
                        setSearchResults([]);
                        setSearchQuery("");
                      }, 200)}
                  />

                  {/* SEARCH RESULTS DROPDOWN */}
                    <div style={{ 
                      position: "absolute", 
                      top: "100%", 
                      left: 0, 
                      right: 0, 
                      backgroundColor: "#ffffff", 
                      opacity: 1, 
                      isolation: "isolate", 
                      border: "1px solid #ccc", 
                      zIndex: 9999, 
                      maxHeight: "300px", 
                      overflowY: "auto", 
                      boxShadow: "0 8px 16px rgba(0,0,0,0.3)" 
                    }}>
                      {family === "NAVAID" ? (
                        // NAVAID RESULTS
                        searchResults.map((nav, idx) => (
                          <div key={idx} onClick={() => handleSelectNavaid(nav)} style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer", fontSize: "12px" }}>
                            <strong>{nav.ident}</strong> - {nav.name} <span style={{ color: "gray" }}>({nav.type})</span>
                          </div>
                        ))
                      ) : (
                        // AIRPORT & HELIPORT RESULTS
                        searchResults.map((apt, idx) => (
                          <div key={idx} style={{ padding: "8px", borderBottom: "1px solid #eee", fontSize: "12px" }}>
                            <strong>{apt.ident}</strong> - {apt.name}
                            <div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              
                              {/* --- THE FIX: Conditional rendering for Heliports vs Airports --- */}
                              {apt.runways && apt.runways.length > 0 ? (
                                apt.runways.map((rwy: any, rIdx: number) => (
                                  <button 
                                    key={rIdx} 
                                    onClick={() => handleSelectRunway(apt, rwy)}
                                    style={{ padding: "2px 6px", fontSize: "10px", backgroundColor: "#0b1b3d", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                                  >
                                    RWY {rwy.le_ident}/{rwy.he_ident}
                                  </button>
                                ))
                              ) : (
                                <button 
                                    onClick={() => handleSelectRunway(apt)}
                                    style={{ padding: "4px 8px", fontSize: "10px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                                  >
                                    Select Heliport Base
                                </button>
                              )}

                            </div>
                          </div>
                        ))
                      )}
                    </div>
                </div>
                {/* --------------------------------- */}

                <label style={labelStyle}>Airport / Group Name</label>
                <input style={inputStyle} value={airportName} onChange={e => setAirportName(e.target.value)} placeholder="e.g. Heathrow (EGLL)" />

                <label style={labelStyle}>Surface Name</label>
                <input style={inputStyle} value={surfName} onChange={e => setSurfName(e.target.value)} placeholder="Name (e.g., RWY 09/27)" />
                
                <label style={labelStyle}>Surface Family</label>
                <select style={inputStyle} value={family} onChange={e => setFamily(e.target.value)}>
                  <option value="OLS">OLS (Annex 14)</option>
                  {/*<option value="OAS">OAS (PANS-OPS)</option>*/}
                  <option value="RNAV">RNAV / RNP Procedure</option>
                  <option value="VSS">VSS (Visual Segment)</option>
                  <option value="OFZ">OFZ / OES</option>
                  <option value="NAVAID">Navaid Restrictive</option>
                  <option value="CUSTOM">Custom Surface</option>
                  <option value="HELIPORT">Heliport OLS (In progress)</option>
                </select>

                {/* --- ONLY SHOW T1, T2, and ARP for Aeroplane OLS and OFZ --- */}
                {(family === "OLS" || family === "OFZ" || family === "VSS") && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={labelStyle}>Threshold 1 (Lat / Lon / Alt)</label>
                      <button style={{...activeTabBtn, padding: "2px 6px", fontSize: "10px"}} onClick={() => getCenterFromMap(setT1, t1)}>📍 Map</button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={t1.lat} onChange={e => setT1({...t1, lat: +e.target.value})} />
                      <input style={numInputStyle} type="number" value={t1.lon} onChange={e => setT1({...t1, lon: +e.target.value})} />
                      <input style={numInputStyle} type="number" value={t1.alt} onChange={e => setT1({...t1, alt: +e.target.value})} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                      <label style={labelStyle}>Threshold 2 (Lat / Lon / Alt)</label>
                      <button style={{...activeTabBtn, padding: "2px 6px", fontSize: "10px"}} onClick={() => getCenterFromMap(setT2, t2)}>📍 Map</button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={t2.lat} onChange={e => setT2({...t2, lat: +e.target.value})} />
                      <input style={numInputStyle} type="number" value={t2.lon} onChange={e => setT2({...t2, lon: +e.target.value})} />
                      <input style={numInputStyle} type="number" value={t2.alt} onChange={e => setT2({...t2, alt: +e.target.value})} />
                    </div>

                    <label style={{...labelStyle, marginTop: "10px"}}>ARP Altitude (m)</label>
                    <input style={inputStyle} type="number" value={arpAlt} onChange={e => setArpAlt(+e.target.value)} />
                  </>
                )}

                {/* NEW RUNWAY TYPE DROPDOWN (Only show for OLS) */}
                {(family === "OFZ") && (
                  <>
                    <label style={labelStyle}>Runway Type</label>
                    <select style={inputStyle} value={runwayType} onChange={e => setRunwayType(e.target.value)}>
                      <option value="non_instrument">Non-Instrument</option>
                      <option value="non_precision">Non-Precision Approach</option>
                      <option value="precision">Precision Approach</option>
                    </select>
                  </>
                )}
                {/* --- STANDARD OLS SETTINGS --- */}
                {family === "OLS" && (
                  <>
                    <label style={labelStyle}>Runway Type / Regulation Set</label>
                    <select style={inputStyle} value={runwayType} onChange={e => setRunwayType(e.target.value)}>
                      <option value="non_instrument">Non-Instrument</option>
                      <option value="non_precision">Non-Precision Approach</option>
                      <option value="precision">Precision Approach</option>
                      <option value="custom">⚙️ Custom Parameters</option>
                    </select>

                    {/* --- NEW: CUSTOM OLS CONFIGURATOR --- */}
                    {runwayType === "custom" && (
                      <div style={{ backgroundColor: "#e9ecef", padding: "12px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px", border: "1px solid #ccc" }}>
                        <p style={{fontSize: "13px", color:"#0b1b3d", margin: "0 0 5px 0", fontWeight: "bold"}}>Custom Parameters (Meters & Percentages)</p>

                        {/* Helper functions to keep UI code incredibly clean and perfectly sized */}
                        {(() => {
                          // Standardized tiny input box with a clear label above it
                          const ParamInput = ({ label, value, onChange }: any) => (
                            <div style={{ display: "flex", flexDirection: "column", width: "65px" }}>
                              <span style={{ fontSize: "10px", color: "#555", marginBottom: "2px", fontWeight: "bold", whiteSpace: "nowrap" }}>{label}</span>
                              <input 
                                type="number" 
                                style={{ padding: "4px", fontSize: "12px", borderRadius: "4px", border: "1px solid #ccc", width: "100%", boxSizing: "border-box" }} 
                                value={value} 
                                onChange={onChange} 
                              />
                            </div>
                          );

                          // Standardized Row: Checkbox on top, inputs wrapped below
                          const CustomRow = ({ label, toggle, inputs }: any) => (
                            <div style={{ display: "flex", flexDirection: "column", padding: "8px", backgroundColor: cOls[toggle as keyof typeof cOls] ? "#ffffff" : "#f5f5f5", borderRadius: "4px", border: "1px solid #ddd", transition: "all 0.2s" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: cOls[toggle as keyof typeof cOls] ? "8px" : "0" }}>
                                <input type="checkbox" checked={cOls[toggle as keyof typeof cOls] as boolean} onChange={(e) => setCOls({...cOls, [toggle]: e.target.checked})} />
                                <strong style={{ fontSize: "12px", color: cOls[toggle as keyof typeof cOls] ? "#0b1b3d" : "#999" }}>{label}</strong>
                              </div>
                              {cOls[toggle as keyof typeof cOls] && (
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginLeft: "22px" }}>
                                  {inputs}
                                </div>
                              )}
                            </div>
                          );

                          return (
                            <>
                              <CustomRow label="Basic Strip" toggle="draw_strip" inputs={
                                <>
                                  <ParamInput label="End Dist." value={cOls.strip_end} onChange={(e: any) => setCOls({...cOls, strip_end: +e.target.value})} />
                                  <ParamInput label="Width (m)" value={cOls.strip_width} onChange={(e: any) => setCOls({...cOls, strip_width: +e.target.value})} />
                                </>
                              }/>
                              
                              <CustomRow label="Approach Surface" toggle="draw_app" inputs={
                                <>
                                  <ParamInput label="Div. (%)" value={cOls.app_div} onChange={(e: any) => setCOls({...cOls, app_div: +e.target.value})} />
                                  <div style={{ width: "1px", backgroundColor: "#eee", margin: "0 4px" }}></div>
                                  <ParamInput label="Sec 1 Len" value={cOls.app_s1_len} onChange={(e: any) => setCOls({...cOls, app_s1_len: +e.target.value})} />
                                  <ParamInput label="Sec 1 Slope" value={cOls.app_s1_slope} onChange={(e: any) => setCOls({...cOls, app_s1_slope: +e.target.value})} />
                                  <div style={{ width: "1px", backgroundColor: "#eee", margin: "0 4px" }}></div>
                                  <ParamInput label="Sec 2 Len" value={cOls.app_s2_len} onChange={(e: any) => setCOls({...cOls, app_s2_len: +e.target.value})} />
                                  <ParamInput label="Sec 2 Slope" value={cOls.app_s2_slope} onChange={(e: any) => setCOls({...cOls, app_s2_slope: +e.target.value})} />
                                  <div style={{ width: "1px", backgroundColor: "#eee", margin: "0 4px" }}></div>
                                  <ParamInput label="Sec 3 Len" value={cOls.app_s3_len} onChange={(e: any) => setCOls({...cOls, app_s3_len: +e.target.value})} />
                                  <ParamInput label="Sec 3 Slope" value={cOls.app_s3_slope} onChange={(e: any) => setCOls({...cOls, app_s3_slope: +e.target.value})} />
                                </>
                              }/>

                              <CustomRow label="Take-off Climb Surface" toggle="draw_dep" inputs={
                                <>
                                  <ParamInput label="Start Offset" value={cOls.dep_start} onChange={(e: any) => setCOls({...cOls, dep_start: +e.target.value})} />
                                  <ParamInput label="Inner W." value={cOls.dep_inner} onChange={(e: any) => setCOls({...cOls, dep_inner: +e.target.value})} />
                                  <ParamInput label="Max W." value={cOls.dep_max_w} onChange={(e: any) => setCOls({...cOls, dep_max_w: +e.target.value})} />
                                  <ParamInput label="Div. (%)" value={cOls.dep_div} onChange={(e: any) => setCOls({...cOls, dep_div: +e.target.value})} />
                                  <ParamInput label="Length (m)" value={cOls.dep_len} onChange={(e: any) => setCOls({...cOls, dep_len: +e.target.value})} />
                                  <ParamInput label="Slope (%)" value={cOls.dep_slope} onChange={(e: any) => setCOls({...cOls, dep_slope: +e.target.value})} />
                                </>
                              }/>

                              <CustomRow label="Transitional Surface" toggle="draw_trans" inputs={
                                <ParamInput label="Slope (%)" value={cOls.trans_slope} onChange={(e: any) => setCOls({...cOls, trans_slope: +e.target.value})} />
                              }/>

                              <CustomRow label="Inner Horizontal Surface (IHS)" toggle="draw_ihs" inputs={
                                <ParamInput label="Radius (m)" value={cOls.ihs_radius} onChange={(e: any) => setCOls({...cOls, ihs_radius: +e.target.value})} />
                              }/>

                              <CustomRow label="Conical Surface" toggle="draw_conical" inputs={
                                <>
                                  <ParamInput label="Height (m)" value={cOls.conical_height} onChange={(e: any) => setCOls({...cOls, conical_height: +e.target.value})} />
                                  <ParamInput label="Slope (%)" value={cOls.conical_slope} onChange={(e: any) => setCOls({...cOls, conical_slope: +e.target.value})} />
                                </>
                              }/>
                              
                              <CustomRow label="Balked Landing Surface" toggle="draw_balked" inputs={
                                <>
                                  <ParamInput label="Start Offset" value={cOls.balked_start} onChange={(e: any) => setCOls({...cOls, balked_start: +e.target.value})} />
                                  <ParamInput label="Div. (%)" value={cOls.balked_div} onChange={(e: any) => setCOls({...cOls, balked_div: +e.target.value})} />
                                  <ParamInput label="Slope (%)" value={cOls.balked_slope} onChange={(e: any) => setCOls({...cOls, balked_slope: +e.target.value})} />
                                </>
                              }/>

                              <CustomRow label="Inner Approach Surface" toggle="draw_in_app" inputs={
                                <>
                                  <ParamInput label="Offset" value={cOls.in_app_offset} onChange={(e: any) => setCOls({...cOls, in_app_offset: +e.target.value})} />
                                  <ParamInput label="Half-W (m)" value={cOls.in_app_hw} onChange={(e: any) => setCOls({...cOls, in_app_hw: +e.target.value})} />
                                  <ParamInput label="Length (m)" value={cOls.in_app_len} onChange={(e: any) => setCOls({...cOls, in_app_len: +e.target.value})} />
                                  <ParamInput label="Slope (%)" value={cOls.in_app_slope} onChange={(e: any) => setCOls({...cOls, in_app_slope: +e.target.value})} />
                                </>
                              }/>

                              <CustomRow label="Inner Transitional" toggle="draw_in_trans" inputs={<span style={{fontSize: "11px", color: "#666", marginTop:"4px"}}>Derived from Inner Approach & Strip settings.</span>} />
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}
                {/* DYNAMIC HELIPORT FIELDS */}
                {family === "HELIPORT" && (
                  <div style={{ backgroundColor: "#e9ecef", padding: "10px", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    
                    {/* --- TYPE & PRESET --- */}
                    <div style={{ display: "flex", gap: "10px", marginBottom: "5px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                        <div style={{flex: 1}}>
                            <label style={{...labelStyle, color: "#d35400"}}>FATO Type</label>
                            <select style={inputStyle} value={heliParams.fatoType} onChange={e => { setHeliParams({...heliParams, fatoType: e.target.value}); setHeliPreset("custom"); }}>
                                <option value="non_instrument">Non-Instrument</option>
                                <option value="non_precision">Non-Precision Approach</option>
                                <option value="precision">Precision Approach</option>
                            </select>
                        </div>
                        <div style={{flex: 1}}>
                            <label style={{...labelStyle, color: "#d35400"}}>Annex 14 Presets</label>
                            <select style={inputStyle} value={heliPreset} onChange={handleHeliPresetChange}>
                                <option value="custom">Custom Parameters</option>
                                <option value="cat_a">Slope Category A (PC1)</option>
                                <option value="cat_b">Slope Category B (PC3)</option>
                                <option value="cat_c">Slope Category C (PC2)</option>
                                <option value="non_precision">Instrument Non-Precision</option>
                                <option value="precision">Instrument Precision</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label style={{...labelStyle, color: "#008b8b"}}>Heliport FATO Center (Lat / Lon / Alt)</label>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={heliParams.lat} onChange={e => setHeliParams({...heliParams, lat: +e.target.value})} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={heliParams.lon} onChange={e => setHeliParams({...heliParams, lon: +e.target.value})} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={heliParams.alt} onChange={e => setHeliParams({...heliParams, alt: +e.target.value})} placeholder="Alt" />
                    </div>

                    <div style={rowStyle}>
                        <div style={{flex:1}}>
                            <label style={labelStyle}>Take-off Bearing (°)</label>
                            <input style={inputStyle} type="number" value={heliParams.bearing} onChange={e => setHeliParams({...heliParams, bearing: +e.target.value})} />
                        </div>
                        <div style={{flex:1}}>
                            <label style={labelStyle}>Safety Area Width (m)</label>
                            <input style={inputStyle} type="number" value={heliParams.innerWidth} onChange={e => setHeliParams({...heliParams, innerWidth: +e.target.value})} />
                        </div>
                        <div style={{flex:1}}>
                            <label style={labelStyle}>Start Offset (m)</label>
                            <input style={inputStyle} type="number" value={heliParams.startOffset} onChange={e => setHeliParams({...heliParams, startOffset: +e.target.value})} />
                        </div>
                    </div>

                    {/* --- MULTI-SECTION BUILDER --- */}
                    <label style={{...labelStyle, marginTop: "10px", color: "#27ae60"}}>Approach Surface (Inbound)</label>
                    <div style={{ display: "flex", gap: "5px", fontSize: "10px", fontWeight: "bold" }}>
                        <span style={{flex:1}}>Section</span><span style={{flex:1}}>Length (m)</span><span style={{flex:1}}>Slope (%)</span><span style={{flex:1}}>Div (%)</span>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                        <span style={{flex:1, fontSize:"11px", alignSelf:"center"}}>1 (Inner)</span>
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.appS1Len} onChange={e => { setHeliParams({...heliParams, appS1Len: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.appS1Slope} onChange={e => { setHeliParams({...heliParams, appS1Slope: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.appS1Div} onChange={e => { setHeliParams({...heliParams, appS1Div: +e.target.value}); setHeliPreset("custom"); }} />
                    </div>
                    <div style={{ display: "flex", gap: "5px", marginTop: "3px" }}>
                        <span style={{flex:1, fontSize:"11px", alignSelf:"center"}}>2 (Mid)</span>
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.appS2Len} onChange={e => { setHeliParams({...heliParams, appS2Len: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.appS2Slope} onChange={e => { setHeliParams({...heliParams, appS2Slope: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.appS2Div} onChange={e => { setHeliParams({...heliParams, appS2Div: +e.target.value}); setHeliPreset("custom"); }} />
                    </div>
                    <div style={{ display: "flex", gap: "5px", marginTop: "3px" }}>
                        <span style={{flex:1, fontSize:"11px", alignSelf:"center"}}>3 (Outer)</span>
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.appS3Len} onChange={e => { setHeliParams({...heliParams, appS3Len: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.appS3Slope} onChange={e => { setHeliParams({...heliParams, appS3Slope: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.appS3Div} onChange={e => { setHeliParams({...heliParams, appS3Div: +e.target.value}); setHeliPreset("custom"); }} />
                    </div>

                    <label style={{...labelStyle, marginTop: "10px", color: "#c0392b"}}>Take-off Climb Surface (Outbound)</label>
                    <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
                        <span style={{flex:1, fontSize:"11px", alignSelf:"center"}}>1 (Inner)</span>
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.tkofS1Len} onChange={e => { setHeliParams({...heliParams, tkofS1Len: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.tkofS1Slope} onChange={e => { setHeliParams({...heliParams, tkofS1Slope: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.tkofS1Div} onChange={e => { setHeliParams({...heliParams, tkofS1Div: +e.target.value}); setHeliPreset("custom"); }} />
                    </div>
                    <div style={{ display: "flex", gap: "5px", marginTop: "3px" }}>
                        <span style={{flex:1, fontSize:"11px", alignSelf:"center"}}>2 (Mid)</span>
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.tkofS2Len} onChange={e => { setHeliParams({...heliParams, tkofS2Len: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.tkofS2Slope} onChange={e => { setHeliParams({...heliParams, tkofS2Slope: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.tkofS2Div} onChange={e => { setHeliParams({...heliParams, tkofS2Div: +e.target.value}); setHeliPreset("custom"); }} />
                    </div>
                    <div style={{ display: "flex", gap: "5px", marginTop: "3px" }}>
                        <span style={{flex:1, fontSize:"11px", alignSelf:"center"}}>3 (Outer)</span>
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.tkofS3Len} onChange={e => { setHeliParams({...heliParams, tkofS3Len: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.tkofS3Slope} onChange={e => { setHeliParams({...heliParams, tkofS3Slope: +e.target.value}); setHeliPreset("custom"); }} />
                        <input style={{...numInputStyle, padding:"4px"}} type="number" value={heliParams.tkofS3Div} onChange={e => { setHeliParams({...heliParams, tkofS3Div: +e.target.value}); setHeliPreset("custom"); }} />
                    </div>

                  </div>
                )}
                
                {/* --- DYNAMIC RNAV FIELDS --- */}
                {family === "RNAV" && (
                  <div style={{ backgroundColor: "#e9ecef", padding: "10px", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    
                    <div style={rowStyle}>
                        <div style={{flex:1}}>
                            <label style={labelStyle}>Mode</label>
                            <select style={inputStyle} value={rnavMode} onChange={e => setRnavMode(e.target.value)}>
                              <option value="RNP APCH">RNP APCH</option>
                              <option value="Advanced RNP">Advanced RNP</option>
                            </select>
                        </div>
                        <div style={{flex:0.5}}>
                            <label style={labelStyle}>Alt Unit</label>
                            <select style={inputStyle} value={altUnit} onChange={e => setAltUnit(e.target.value)}>
                              <option value="m">Meters</option>
                              <option value="ft">Feet</option>
                            </select>
                        </div>
                    </div>

                    <label style={{...labelStyle, color: "#d35400"}}>1. Intermediate Fix (IF)</label>
                    <div style={rowStyle}>
                        <input style={numInputStyle} placeholder="Lat" type="number" value={ifPos.lat} onChange={e => setIfPos({...ifPos, lat: +e.target.value})} />
                        <input style={numInputStyle} placeholder="Lon" type="number" value={ifPos.lon} onChange={e => setIfPos({...ifPos, lon: +e.target.value})} />
                    </div>

                    <label style={{...labelStyle, color: "#27ae60"}}>2. Final Approach Fix (FAF)</label>
                    <div style={rowStyle}>
                        <input style={numInputStyle} placeholder="Lat" type="number" value={fafPos.lat} onChange={e => setFafPos({...fafPos, lat: +e.target.value})} />
                        <input style={numInputStyle} placeholder="Lon" type="number" value={fafPos.lon} onChange={e => setFafPos({...fafPos, lon: +e.target.value})} />
                        <input style={numInputStyle} placeholder={`Alt (${altUnit})`} type="number" value={fafPos.alt} onChange={e => setFafPos({...fafPos, alt: +e.target.value})} />
                    </div>

                    <label style={{...labelStyle, color: "#c0392b"}}>3. Missed Approach Point (MAPt)</label>
                    <div style={rowStyle}>
                        <input style={numInputStyle} placeholder="Lat" type="number" value={maptPos.lat} onChange={e => setMaptPos({...maptPos, lat: +e.target.value})} />
                        <input style={numInputStyle} placeholder="Lon" type="number" value={maptPos.lon} onChange={e => setMaptPos({...maptPos, lon: +e.target.value})} />
                        <input style={numInputStyle} placeholder={`Alt (${altUnit})`} type="number" value={maptPos.alt} onChange={e => setMaptPos({...maptPos, alt: +e.target.value})} />
                    </div>

                    <label style={{...labelStyle, display: "flex", alignItems: "center", gap: "5px", marginTop: "10px", cursor: "pointer"}}>
                        <input type="checkbox" checked={useCustomRnav} onChange={e => setUseCustomRnav(e.target.checked)} />
                        Manual Override (XTT / ATT / Semi-width in NM)
                    </label>

                    {useCustomRnav && (
                        <div style={{border: "1px solid #ccc", padding: "5px", borderRadius: "4px", backgroundColor: "#fff"}}>
                            <div style={{display:"flex", gap:"5px", fontSize:"10px", fontWeight:"bold", marginBottom:"5px"}}>
                                <span style={{flex:1}}>Fix</span><span style={{flex:1}}>XTT</span><span style={{flex:1}}>ATT</span><span style={{flex:1}}>SW</span>
                            </div>
                            {/* IF Override */}
                            <div style={{display:"flex", gap:"5px", marginBottom:"3px"}}>
                                <span style={{flex:1, fontSize:"11px"}}>IF</span>
                                <input style={{...numInputStyle, padding:"2px"}} type="number" value={rnavOverrides.if_xtt} onChange={e => setRnavOverrides({...rnavOverrides, if_xtt: +e.target.value})} />
                                <input style={{...numInputStyle, padding:"2px"}} type="number" value={rnavOverrides.if_att} onChange={e => setRnavOverrides({...rnavOverrides, if_att: +e.target.value})} />
                                <input style={{...numInputStyle, padding:"2px"}} type="number" value={rnavOverrides.if_sw} onChange={e => setRnavOverrides({...rnavOverrides, if_sw: +e.target.value})} />
                            </div>
                            {/* FAF Override */}
                            <div style={{display:"flex", gap:"5px", marginBottom:"3px"}}>
                                <span style={{flex:1, fontSize:"11px"}}>FAF</span>
                                <input style={{...numInputStyle, padding:"2px"}} type="number" value={rnavOverrides.faf_xtt} onChange={e => setRnavOverrides({...rnavOverrides, faf_xtt: +e.target.value})} />
                                <input style={{...numInputStyle, padding:"2px"}} type="number" value={rnavOverrides.faf_att} onChange={e => setRnavOverrides({...rnavOverrides, faf_att: +e.target.value})} />
                                <input style={{...numInputStyle, padding:"2px"}} type="number" value={rnavOverrides.faf_sw} onChange={e => setRnavOverrides({...rnavOverrides, faf_sw: +e.target.value})} />
                            </div>
                            {/* MAPt Override */}
                            <div style={{display:"flex", gap:"5px"}}>
                                <span style={{flex:1, fontSize:"11px"}}>MAPt</span>
                                <input style={{...numInputStyle, padding:"2px"}} type="number" value={rnavOverrides.mapt_xtt} onChange={e => setRnavOverrides({...rnavOverrides, mapt_xtt: +e.target.value})} />
                                <input style={{...numInputStyle, padding:"2px"}} type="number" value={rnavOverrides.mapt_att} onChange={e => setRnavOverrides({...rnavOverrides, mapt_att: +e.target.value})} />
                                <input style={{...numInputStyle, padding:"2px"}} type="number" value={rnavOverrides.mapt_sw} onChange={e => setRnavOverrides({...rnavOverrides, mapt_sw: +e.target.value})} />
                            </div>
                        </div>
                    )}
                  </div>
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
                        <option value="ILS_LLZ_SF">ILS LLZ (Single Frequency)</option>
                        <option value="ILS_LLZ_DF">ILS LLZ (Dual Frequency)</option>
                        <option value="ILS_GP">ILS Glide Path (GP)</option>
                        <option value="MLS_AZ">MLS Azimuth</option>
                        <option value="MLS_EL">MLS Elevation</option>
                        <option value="DME_DIR">DME (Directional)</option>
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
                        accept=".csv,.txt,.kml,.dxf"
                        onChange={handleFileUpload} 
                        style={inputStyle} 
                        disabled={!user?.is_premium}
                    />
                    
                    <label style={labelStyle}>Coordinates (ID, Lat, Lon, Alt)</label>
                    <textarea 
                        style={{ ...inputStyle, height: "120px", fontFamily: "monospace", fontSize: "11px" }} 
                        placeholder={`Format: Name, Lat1, Lon1, Alt1, Lat2, Lon2, Alt2...\nExample:\nBuilding_A, 51.47, -0.45, 100, 51.48, -0.44, 105, 51.46, -0.44, 100`}
                        value={customPoints}
                        onChange={e => setCustomPoints(e.target.value)}
                        disabled={!user?.is_premium}
                    />
                    {!user?.is_premium && <p style={{ color: "red", fontSize: "12px", margin: 0 }}>Please upgrade to Premium to define Custom Surfaces.</p>}
                  </div>
                )}

                <button 
                  onClick={handleDefine} 
                  style={{...createBtnStyle, opacity: isCreating ? 0.7 : 1, cursor: isCreating ? "wait" : "pointer"}}
                  disabled={isCreating}
                >
                  {isCreating ? "⏳ Creating Surface..." : `Create ${family}`}
                </button>
              </div>
            )}

            {/* --- ANALYZE TAB --- */}
            {activeTab === "analyze" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                
                {/* --- UPDATED: Show Checkbox if User has Token OR Airport Owner has Token --- */}
                {(currentOwnerToken || (user?.is_premium && user?.ion_token)) && (
                  <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", color: "#333", cursor: "pointer", marginLeft: "15px" }}>
                    <input 
                      type="checkbox" 
                      checked={showGoogleTiles} 
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setShowGoogleTiles(isChecked);
                        
                        // If checking the box, ensure we are using the correct token
                        if (isChecked) {
                            // Priority: Specific Airport Owner Token -> My Personal Token -> Default
                            const tokenToUse = currentOwnerToken || user?.ion_token || DEFAULT_ION_TOKEN;
                            Cesium.Ion.defaultAccessToken = tokenToUse;
                        }
                      }} 
                    />
                    Google 3D Tiles
                  </label>
                )}

                {/* 1. PUBLIC PREMIUM SURFACES SEARCH */}
                <div style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", position: "relative" }}>
                  <label style={{...labelStyle, color: "#0b1b3d", display: "block", marginBottom: "5px"}}>
                    Search Verified Surfaces (CAA surfaces)
                  </label>
                  <input 
                    style={inputStyle} 
                    value={pubSurfQuery}
                    onChange={e => handleSearchPublicSurfaces(e.target.value)}
                    onFocus={e => {
                        // Only fetch if the dropdown isn't already showing
                        if (pubSurfResults.length === 0) {
                            handleSearchPublicSurfaces(e.target.value);
                        }
                    }}
                    onBlur={() => {
                        // Delay the hide by 200ms so the user can click the dropdown item
                        setTimeout(() => setPubSurfResults([]), 200);
                    }}
                    placeholder="Click to see available airports or type..."
                  />
                  {/* SEARCH RESULTS AUTOCOMPLETE */}
                  {pubSurfResults.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "white", border: "1px solid #ccc", zIndex: 100, maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                      {pubSurfResults.map((s: any, idx) => (
                        <div 
                          key={idx} 
                          onClick={async () => {
                            setSelectedAnalysisAirport(s.airport_name);
                            setSelectedAnalysisOwner(s.owner_id);
                            setPubSurfQuery(s.airport_name); 
                            setPubSurfResults([]); 
                            
                            try {
                              // Fetch Surfaces + The Owner's Custom Token
                              const res = await fetch(`${API_BASE}/airports/${s.owner_id}/${encodeURIComponent(s.airport_name)}`);
                              if (res.ok) {
                                const data = await res.json();
                                
                                // --- THE TOKEN SWAP ---
                                if (data.ion_token) {
                                  console.log("Switching to CAA Custom data...");
                                  Cesium.Ion.defaultAccessToken = data.ion_token;
                                  setCurrentOwnerToken(data.ion_token); // --- NEW: Save to state! ---
                                } else {
                                  console.log("Using Default Altitude Nexus Data.");
                                  Cesium.Ion.defaultAccessToken = DEFAULT_ION_TOKEN;
                                  setCurrentOwnerToken(null); // Reset if no custom token
                                }

                                // If 3D Buildings are currently ON, we must reload them to use the new token!
                                if (showBuildings && viewerRef.current) {
                                  // 1. Remove existing buildings
                                  if (buildingsRef.current) {
                                    viewerRef.current.scene.primitives.remove(buildingsRef.current);
                                    buildingsRef.current = null;
                                  }
                                  // 2. Re-fetch with new token
                                  try {
                                    const buildings = await Cesium.createOsmBuildingsAsync();
                                    viewerRef.current.scene.primitives.add(buildings);
                                    buildingsRef.current = buildings;
                                  } catch (err) { console.error("Failed to reload buildings with new data", err); }
                                }

                                let newOffset = geoidOffset;
                                if (data.surfaces.length > 0 && data.surfaces[0].geometry.length > 0) {
                                  const coords = data.surfaces[0].geometry[0].coords;
                                  newOffset = await autoFetchGeoidOffset(coords[1], coords[0]);
                                }

                                // Draw the surfaces
                                handleDrawSurface(data.surfaces, newOffset);
                              }
                            } catch (err) {
                              console.error("Could not load airport geometry or token.");
                            }
                          }}
                          style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer", fontSize: "12px" }}
                        >
                          <strong>{s.airport_name}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. MY SURFACES DROPDOWN */}
                <label style={labelStyle}>Or select from your saved airports</label>
                <select 
                  style={inputStyle} 
                  value={selectedAnalysisOwner === user?.id ? selectedAnalysisAirport : ""} 
                  onChange={async e => { // <-- 1. Mark as async
                    const chosenAirport = e.target.value;
                    setSelectedAnalysisAirport(chosenAirport);
                    setSelectedAnalysisOwner(user?.id || 0);
                    setPubSurfQuery(""); 
                    
                    if (chosenAirport) {
                      const airportSurfaces = savedSurfaces.filter(s => s.airport_name === chosenAirport);
                      
                      let newOffset = geoidOffset;
                      if (airportSurfaces.length > 0 && airportSurfaces[0].geometry.length > 0) {
                         const coords = airportSurfaces[0].geometry[0].coords;
                         newOffset = await autoFetchGeoidOffset(coords[1], coords[0]);
                      }

                      // Pass the offset directly!
                      handleDrawSurface(airportSurfaces, newOffset);
                    } else {
                      if (viewerRef.current) viewerRef.current.entities.removeAll();
                    }
                  }}
                >
                  <option value="">Select your airport...</option>
                  {Array.from(new Set(savedSurfaces.map(s => s.airport_name))).map(airport => (
                    <option key={airport} value={airport}>{airport}</option>
                  ))}
                </select>
                
                <hr style={{ borderTop: "1px solid #eee", width: "100%" }}/>
                <label style={labelStyle}>Obstacle (Lat / Lon / Alt)</label>
                <div style={rowStyle}>
                  <input style={numInputStyle} type="number" value={obsPos.lat} onChange={e => setObsPos({...obsPos, lat: +e.target.value})} />
                  <input style={numInputStyle} type="number" value={obsPos.lon} onChange={e => setObsPos({...obsPos, lon: +e.target.value})} />
                  <input style={numInputStyle} type="number" value={obsPos.alt} onChange={e => setObsPos({...obsPos, alt: +e.target.value})} />
                </div>

                <button 
                  style={{ ...createBtnStyle, backgroundColor: "#0b1b3d", opacity: isAnalyzing ? 0.7 : 1, cursor: isAnalyzing ? "wait" : "pointer" }}
                  disabled={isAnalyzing}
                  onClick={async () => {
                    if (!selectedAnalysisAirport) return alert("Please select an airport first!");
                    
                    // Clear previous results while loading
                    setIsAnalyzing(true); // START LOADING
                    setAnalysisResult(null);
                    try {
                      const isGuestAirport = selectedAnalysisOwner === 0;
                      const guestPayload = isGuestAirport 
                        ? savedSurfaces.filter(s => s.airport_name === selectedAnalysisAirport).map(s => ({name: s.name, geometry: s.geometry}))
                        : null;
                      
                      const res = await fetch(`${API_BASE}/analyze`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          lat: obsPos.lat,
                          lon: obsPos.lon,
                          alt: obsPos.alt,
                          airport_name: selectedAnalysisAirport,
                          owner_id: selectedAnalysisOwner,
                          guest_surfaces: guestPayload // --- NEW ---
                        }),
                      });
                      
                      const result = await res.json();
                      if (result.error) return alert(result.error);
                      
                      // Save result to state instead of an alert!
                      setAnalysisResult(result);
                      } catch (err) {
                        alert("Analysis failed.");
                    } finally {
                        setIsAnalyzing(false); // STOP LOADING
                    }
                  }}
                >
                  {isAnalyzing ? "⚙️ Processing Geometry..." : "Run Analysis"}
                </button>

                {/* --- NEW: ANALYSIS RESULTS UI & PDF EXPORT --- */}
                {analysisResult && (
                  <div style={{ backgroundColor: analysisResult.penetration ? "#f8d7da" : "#d4edda", padding: "15px", borderRadius: "6px", border: `1px solid ${analysisResult.penetration ? "#f5c6cb" : "#c3e6cb"}`, marginTop: "10px" }}>
                    <h4 style={{ margin: "0 0 10px 0", color: analysisResult.penetration ? "#721c24" : "#155724" }}>
                      {analysisResult.penetration ? "❌ VIOLATION DETECTED" : "✅ OBSTACLE CLEAR"}
                    </h4>
                    
                    <p style={{ fontSize: "12px", color: "#333", margin: "0 0 5px 0" }}>
                      <strong>Limiting Surface:</strong> {analysisResult.limiting_surface}
                    </p>
                    <p style={{ fontSize: "12px", color: "#333", margin: "0 0 15px 0" }}>
                      <strong>Margin:</strong> {analysisResult.margin} m
                    </p>

                    <button 
                      style={{ ...activeTabBtn, width: "100%", backgroundColor: "#343a40", fontSize: "13px" }}
                      onClick={generatePDF}
                    >
                      📄 Download Official Report (PDF)
                    </button>
                  </div>
                )}

                {/* --- PREMIUM: BATCH OBSTACLE UPLOAD --- */}
                <div style={{ backgroundColor: "#e8f0fe", padding: "10px", borderRadius: "4px", marginTop: "15px", border: "1px solid #cce5ff", opacity: user?.is_premium ? 1 : 0.6 }}>
                  
                  {/* TITLE & FILE UPLOAD ROW */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{...labelStyle, color: "#0b1b3d", margin: 0, display: "flex", alignItems: "center"}}>
                        ★ Batch Upload
                        {/* Tooltip Icon */}
                        <span 
                            title="Accepted Format: ID, Lat, Lon, Alt (comma-separated).&#10;Example: Crane_1, 51.47, -0.45, 120" 
                            style={{ cursor: "help", marginLeft: "8px", backgroundColor: "#0b1b3d", color: "white", borderRadius: "50%", width: "16px", height: "16px", display: "inline-flex", justifyContent: "center", alignItems: "center", fontSize: "11px", fontWeight: "bold" }}
                        >
                            ?
                        </span>
                      </label>
                      
                      {/* FILE UPLOAD BUTTON */}
                      <input
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleBatchFileUpload}
                          disabled={!user?.is_premium}
                          style={{ fontSize: "11px", maxWidth: "160px" }}
                      />
                  </div>
                  
                  <textarea 
                    style={{ ...inputStyle, height: "100px", fontFamily: "monospace", fontSize: "12px" }} 
                    placeholder={`Crane_1, 51.47, -0.45, 120\nBuilding_A, 51.472, -0.44, 95\n...`}
                    value={batchInput}
                    onChange={e => setBatchInput(e.target.value)}
                    disabled={!user?.is_premium}
                  />
                  
                  <div style={{ ...rowStyle, marginTop: "10px" }}>
                    <button 
                      style={{ ...activeTabBtn, backgroundColor: user?.is_premium ? "#0b1b3d" : "#ccc", fontSize: "12px", opacity: isAnalyzingBatch ? 0.7 : 1 }}
                      disabled={!user?.is_premium || isAnalyzingBatch}
                      onClick={handleBatchAnalyze}
                    >
                      {isAnalyzingBatch ? "⏳ Processing..." : "Run Batch Analysis"}
                    </button>
                    
                    <button 
                      style={{ ...activeTabBtn, backgroundColor: user?.is_premium && batchResults.length > 0 ? "#0b1b3d" : "#ccc", fontSize: "12px" }}
                      disabled={!user?.is_premium || batchResults.length === 0}
                      onClick={downloadBatchCSV}
                    >
                      Download Results (.CSV)
                    </button>

                    {/* --- NEW: PDF REPORT EXPORT --- */}
                    <button 
                      style={{ ...activeTabBtn, backgroundColor: user?.is_premium && batchResults.length > 0 ? "#8b0000" : "#ccc", fontSize: "12px" }}
                      disabled={!user?.is_premium || batchResults.length === 0}
                      onClick={generateBatchPDF}
                    >
                      📄 Official Results PDF
                    </button>
                  </div>

                  {!user?.is_premium && (
                    <p style={{ color: "red", fontSize: "11px", marginTop: "8px", textAlign: "center" }}>
                      Upgrade to Premium to analyze hundreds of obstacles instantly.
                    </p>
                  )}
                </div>

                {/* --- PREMIUM EXPORT PANEL --- */}
                {selectedAnalysisAirport && (
                  <div style={{ backgroundColor: "#fff3cd", padding: "10px", borderRadius: "4px", marginBottom: "15px", border: "1px solid #ffeeba" }}>
                    <label style={{...labelStyle, color: "#856404", marginBottom: "8px", display: "block"}}>
                      ★ Premium Export Tools
                    </label>
                    
                    <div style={rowStyle}>
                      <button 
                        style={{ ...activeTabBtn, backgroundColor: user?.is_premium ? "#0b1b3d" : "#ccc", fontSize: "12px" }}
                        disabled={!user?.is_premium}
                        onClick={() => handleExport('kml')}
                      >
                        Download .KML
                      </button>
                      
                      <button 
                        style={{ ...activeTabBtn, backgroundColor: user?.is_premium ? "#0b1b3d" : "#ccc", fontSize: "12px" }}
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
            {activeTab === "dashboard" && (() => {
              const uniqueAirportsCount = new Set(savedSurfaces.map(s => s.airport_name)).size;
              const maxAirports = user ? user.max_airports : 0; // --- NEW: Dynamic from DB! ---
              
              return (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <label style={{...labelStyle, margin: 0}}>
                    My Saved Airspaces
                  </label>
                  
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: user?.is_premium ? "#0b1b3d" : "#666" }}>
                    Storage: {uniqueAirportsCount} / {maxAirports} Airports
                  </span>
                </div>

                {/* --- PREMIUM: MANAGE AIRPORT SETTINGS --- */}
                {user?.is_premium && uniqueAirportsCount > 0 && (
                  <div style={{ backgroundColor: "#e8f0fe", padding: "10px", borderRadius: "4px", marginBottom: "15px", border: "1px solid #cce5ff" }}>
                    <label style={{...labelStyle, margin: 0, color: "#0b1b3d", display: "block", marginBottom: "5px"}}>
                      ⚙️ Manage Airport Settings
                    </label>
                    <select 
                      style={inputStyle} 
                      value={manageAptSelect} 
                      onChange={e => {
                        const apt = e.target.value;
                        setManageAptSelect(apt);
                        setManageAptName(apt);
                        // Find if this airport is currently public
                        const surf = savedSurfaces.find(s => s.airport_name === apt);
                        setManageAptPublic(surf?.is_public ?? true);
                      }}
                    >
                      <option value="">Select an airport to edit...</option>
                      {Array.from(new Set(savedSurfaces.map(s => s.airport_name))).map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>

                    {manageAptSelect && (
                      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <input 
                          style={inputStyle} 
                          value={manageAptName} 
                          onChange={e => setManageAptName(e.target.value)} 
                          placeholder="New Airport Name" 
                        />
                        <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                          <input 
                            type="checkbox" 
                            checked={manageAptPublic} 
                            onChange={e => setManageAptPublic(e.target.checked)} 
                          />
                          Public (Visible in CAA Verified Search)
                        </label>
                        <button 
                          style={{ ...activeTabBtn, backgroundColor: "#0b1b3d", padding: "6px 12px", fontSize: "12px" }}
                          onClick={async () => {
                            if (!manageAptName) return alert("Name cannot be empty.");
                            const res = await fetch(`${API_BASE}/airports/${encodeURIComponent(manageAptSelect)}`, {
                              method: "PUT",
                              headers: getAuthHeaders(),
                              body: JSON.stringify({ new_name: manageAptName, is_public: manageAptPublic })
                            });
                            if (res.ok) {
                              alert("Airport updated successfully!");
                              // Instantly update the local UI state without needing to refresh
                              setSavedSurfaces(prev => prev.map(s => 
                                s.airport_name === manageAptSelect 
                                  ? { ...s, airport_name: manageAptName, is_public: manageAptPublic } 
                                  : s
                              ));
                              setManageAptSelect(manageAptName); // Update dropdown reference
                            } else {
                              const err = await res.json();
                              alert(`Error: ${err.detail || "Failed to update"}`);
                            }
                          }}
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                )}

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
                          <strong style={{ fontSize: "13px", color: "#333" }}>
                            {s.airport_name ? `${s.airport_name} - ` : ""}{s.name}
                          </strong>
                          <span style={{ fontSize: "10px", backgroundColor: "#e9ecef", padding: "2px 6px", borderRadius: "10px", color: "#555" }}>
                            {s.family}
                          </span>
                        </div>
                        
                        <div style={{ fontSize: "11px", color: "#666", margin: "8px 0" }}>
                          Contains {s.geometry.length} 3D geometric meshes.
                        </div>
                        
                        {/* --- DASHBOARD CARD ACTIONS --- */}
                        <div style={{...rowStyle, marginTop: "8px"}}>
                          <button 
                            style={{...activeTabBtn, backgroundColor: "#0053ac", fontSize: "11px", padding: "6px"}} 
                            onClick={async () => {
                              // Auto-fetch offset before drawing from dashboard
                              let newOffset = geoidOffset;
                              if (s.geometry && s.geometry.length > 0 && s.geometry[0].coords.length >= 2) {
                                const coords = s.geometry[0].coords;
                                newOffset = await autoFetchGeoidOffset(coords[1], coords[0]);
                              }
                              handleDrawSurface([s], newOffset);
                            }}
                          >
                            🗺️ Draw
                          </button>
                          
                          {/* NEW: Edit/Expand Button */}
                          <button 
                            style={{...activeTabBtn, backgroundColor: "#6c757d", fontSize: "11px", padding: "6px"}} 
                            onClick={() => setExpandedSurfaceId(expandedSurfaceId === s.id ? null : s.id)}
                          >
                            {expandedSurfaceId === s.id ? "▲ Close" : "▼ Components"}
                          </button>

                          <button 
                            style={{...activeTabBtn, backgroundColor: "#ae2936", flex: 0.4, fontSize: "11px", padding: "6px"}} 
                            onClick={() => handleDeleteSurface(s.id)}
                          >
                            🗑️ All
                          </button>
                        </div>

                        {/* --- EXPANDED COMPONENT LIST --- */}
                        {expandedSurfaceId === s.id && (
                            <div style={{ marginTop: "10px", padding: "5px", backgroundColor: "#fff", border: "1px solid #eee", borderRadius: "4px" }}>
                                <small style={{ fontWeight: "bold", color: "#555" }}>Individual Layers:</small>
                                <ul style={{ listStyle: "none", padding: 0, margin: "5px 0 0 0" }}>
                                    {s.geometry.map((geo: any, idx: number) => (
                                        <li key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0", padding: "4px 0", fontSize: "11px" }}>
                                            <span style={{ color: "#333" }}>{geo.name}</span>
                                            <button 
                                                onClick={() => handleDeleteComponent(s.id, geo.name)}
                                                style={{ border: "none", background: "none", color: "red", cursor: "pointer", fontWeight: "bold" }}
                                                title="Delete this layer only"
                                            >
                                                ✖
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* FIXED: Check against uniqueAirportsCount */}
                {!user?.is_premium && uniqueAirportsCount >= 1 && (
                  <div style={{ backgroundColor: "#fff3cd", padding: "10px", borderRadius: "4px", border: "1px solid #ffeeba", marginTop: "10px" }}>
                    <p style={{ color: "#856404", fontSize: "11px", margin: 0, textAlign: "center" }}>
                      <strong>Free Tier Limit Reached.</strong><br/>
                      Upgrade to Premium to save up to 10 distinct airport configurations.
                    </p>
                  </div>
                )}
                {/* --- PREMIUM: AUDIT LOG HISTORY EXPORTER --- */}
                {user?.is_premium && (
                  <div style={{ backgroundColor: "#e8f0fe", padding: "15px", borderRadius: "6px", border: "1px solid #cce5ff", marginTop: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                      <label style={{...labelStyle, margin: 0, color: "#0b1b3d"}}>🗄️ Official Authorization Logs</label>
                    </div>
                    
                    <p style={{ fontSize: "11px", color: "#555", margin: "0 0 10px 0" }}>
                      Download a complete CSV record of all official evaluation PDFs generated for your airspaces.
                    </p>

                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: "#333", display: "block", marginBottom: "3px" }}>Start Date</label>
                        <input 
                          type="date" 
                          style={{ ...inputStyle, padding: "6px", fontSize: "12px" }} 
                          value={logStartDate} 
                          onChange={e => setLogStartDate(e.target.value)} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: "#333", display: "block", marginBottom: "3px" }}>End Date</label>
                        <input 
                          type="date" 
                          style={{ ...inputStyle, padding: "6px", fontSize: "12px" }} 
                          value={logEndDate} 
                          onChange={e => setLogEndDate(e.target.value)} 
                        />
                      </div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                      
                      </div>
                    </div>
                    <button 
                        onClick={handleDownloadLogs} 
                        style={{ ...activeTabBtn, backgroundColor: "#176429", padding: "6px 12px", fontSize: "12px", height: "31px", flex: "0 1 auto" }}
                      >
                        📥 Download CSV
                      </button>
                  </div>
                )}
              </div>
            );})()}
          </div>

          {/* --- EXAGGERATION WIDGET --- */}
          <div style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
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
              <span style={{ fontSize: "12px", color: "#0b1b3d", fontWeight: "bold" }}>
                {exaggeration}x
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              defaultValue={1} // Use defaultValue for uncontrolled input behavior
              onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setExaggeration(val);
                  // 1. Instantly update Terrain (Cheap)
                  if (viewerRef.current) {
                      viewerRef.current.scene.verticalExaggeration = val;
                  }
              }}
              onMouseUp={() => {
                  // Only Redraw Surfaces when user RELEASES the mouse
                  if (drawnSurfacesRef.current.length > 0) {
                      // Explicitly pass the current state offset
                      handleDrawSurface(drawnSurfacesRef.current, geoidOffset); 
                  }
              }}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          {/* --- ACCOUNT / LOGIN PANEL (Floating Box) --- */}
          {/* --- ACCOUNT / LOGIN PANEL (Floating Box) --- */}
          <div style={{ 
            position: "absolute", 
            bottom: "100px", 
            right: "20px", 
            zIndex: 10,
            display: "flex", 
            flexDirection: "column", 
            alignItems: "flex-end", // Aligns the toggle button to the right
            gap: "10px"
          }}>
            
            {/* 1. TOGGLE BUTTON (Visible Always) */}
            <button 
              onClick={() => setShowAccountPanel(!showAccountPanel)}
              style={{
                width: "40px", height: "40px", borderRadius: "50%",
                backgroundColor: "white", border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#0b1b3d"
              }}
              title={showAccountPanel ? "Minimize Panel" : "Show Account Panel"}
            >
              {showAccountPanel ? "✕" : (user ? "👤" : "🔑")}
            </button>

            {/* 2. THE PANEL CONTENT (Visible only when Toggled ON) */}
            {showAccountPanel && (
              <div style={{ 
                width: "300px", 
                backgroundColor: "rgba(255, 255, 255, 0.95)", 
                padding: "15px", 
                borderRadius: "8px", 
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)", 
                border: "1px solid #ddd" 
              }}>
                {!user ? (
                  isResending ? (
                    // --- RESEND VERIFICATION PANEL ---
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <strong style={{ fontSize: "14px", color: "#333" }}>Resend Verification</strong>
                      <p style={{ fontSize: "11px", color: "#666", margin: 0 }}>Enter your email to receive a new activation link.</p>
                      
                      <input 
                        style={{...inputStyle, padding: "6px"}} 
                        type="email" 
                        value={resendEmailInput} 
                        onChange={e => setResendEmailInput(e.target.value)} 
                        placeholder="Registered Email Address" 
                      />
                      
                      <button 
                        style={{...activeTabBtn, padding: "8px", backgroundColor: "#17a2b8"}} 
                        onClick={async () => {
                          if (!resendEmailInput) return alert("Please enter your email");
                          
                          const res = await fetch(`${API_BASE}/resend-verification`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: resendEmailInput })
                          });
                          
                          const data = await res.json();
                          alert(data.message);
                          setIsResending(false);
                        }}
                      >
                        Send New Link
                      </button>
                      
                      <button 
                        style={{ backgroundColor: "transparent", border: "none", color: "#666", fontSize: "11px", cursor: "pointer", marginTop: "5px" }} 
                        onClick={() => setIsResending(false)}
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : isForgotPassword ? (
                    // --- FORGOT PASSWORD PANEL ---
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <strong style={{ fontSize: "14px", color: "#333" }}>Reset Password</strong>
                      <p style={{ fontSize: "11px", color: "#666", margin: 0 }}>Enter your account email to receive a reset link.</p>
                      
                      <input style={{...inputStyle, padding: "6px"}} type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Registered Email Address" />
                      
                      <button 
                        style={{...activeTabBtn, padding: "8px", backgroundColor: "#007bff"}} 
                        onClick={async () => {
                          if (!forgotEmail) return alert("Please enter your email");
                          await fetch(`${API_BASE}/forgot-password`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: forgotEmail })
                          });
                          alert("If that email exists in our system, a reset link has been sent.");
                          setIsForgotPassword(false);
                        }}
                      >
                        Send Reset Link
                      </button>
                      
                      <button style={{ backgroundColor: "transparent", border: "none", color: "#666", fontSize: "11px", cursor: "pointer", marginTop: "5px" }} onClick={() => setIsForgotPassword(false)}>
                        Back to Login
                      </button>
                    </div>
                  ) : (
                    // --- EXISTING LOGIN/REGISTER PANEL ---
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "14px", color: "#333" }}>{isRegistering ? "Register Account" : "Guest Mode"}</strong>
                        {!isRegistering && <span style={{ fontSize: "10px", backgroundColor: "#e2e3e5", padding: "2px 6px", borderRadius: "4px" }}>Free</span>}
                      </div>
                      
                      {!isRegistering && <p style={{ fontSize: "11px", color: "#666", margin: 0 }}>Create 1 surface as a guest, or log in.</p>}
                      <hr style={{ margin: "5px 0", borderTop: "1px solid #ddd" }} />
                      
                      {/* --- Email Field (Only shows when registering) --- */}
                      {isRegistering && (
                        <input 
                          style={{...inputStyle, padding: "6px"}} 
                          type="email" 
                          value={registerEmail} 
                          onChange={e => setRegisterEmail(e.target.value)} 
                          placeholder="Email Address" 
                        />
                      )}

                      <input style={{...inputStyle, padding: "6px"}} value={loginInput} onChange={e => setLoginInput(e.target.value)} placeholder="Username" />
                      <input type="password" style={{...inputStyle, padding: "6px"}} value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Password" />

                      <button style={{...activeTabBtn, padding: "8px", backgroundColor: isRegistering ? "#28a745" : "#007bff"}} onClick={handleAuth}>
                        {isRegistering ? "Sign Up" : "Log In"}
                      </button>
                      
                      <button style={{ backgroundColor: "transparent", border: "none", color: "#007bff", fontSize: "11px", cursor: "pointer", marginTop: "5px" }} onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? "Already have an account? Log in." : "Create a FREE PREMIUM account"}
                      </button>

                      {/* --- FORGOT PASSWORD / RESEND --- */}
                      {!isRegistering && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                        <button 
                            style={{ backgroundColor: "transparent", border: "none", color: "#888", fontSize: "10px", cursor: "pointer", textDecoration: "underline" }} 
                            onClick={() => setIsForgotPassword(true)}
                        >
                          Forgot Password?
                        </button>
                        
                        <button 
                            style={{ backgroundColor: "transparent", border: "none", color: "#888", fontSize: "10px", cursor: "pointer", textDecoration: "underline" }} 
                            onClick={() => setIsResending(true)}
                        >
                          Resend Verification
                        </button>
                      </div>
                      )}
                    </div>
                  )
                ) : (
                  // --- LOGGED IN VIEW ---
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px" }}>
                        👤 {user.username} {user.is_premium && <span style={{ color: "gold", textShadow: "0 0 2px rgba(0,0,0,0.2)" }}>★ Premium</span>}
                      </span>
                      <button onClick={handleLogout} style={{ fontSize: "12px", padding: "4px 8px", cursor: "pointer", backgroundColor: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px" }}>Logout</button>
                    </div>

                    {/* --- PROFILE SETTINGS --- */}
                    <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "6px", border: "1px solid #ddd", marginTop: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <label style={{...labelStyle, margin: 0, color: "#333"}}>⚙️ Account Settings</label>
                        <button 
                          onClick={() => setIsEditingProfile(!isEditingProfile)} 
                          style={{ fontSize: "11px", padding: "4px 8px", cursor: "pointer", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}
                        >
                          {isEditingProfile ? "Cancel" : "Edit Profile"}
                        </button>
                      </div>

                      {isEditingProfile ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <input style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="New Username" />
                          <input style={{...inputStyle, padding: "6px", fontSize: "12px"}} type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email Address" />
                          <input style={{...inputStyle, padding: "6px", fontSize: "12px"}} type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="New Password" />
                          
                          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed #ccc" }}>
                            <label style={{ fontSize: "10px", fontWeight: "bold", color: "#666" }}>Custom Buildings data code (Optional)</label>
                            <input 
                              style={{...inputStyle, padding: "6px", fontSize: "12px", fontFamily: "monospace", backgroundColor: "#f0f0f0"}} 
                              value={editIonToken} 
                              onChange={e => setEditIonToken(e.target.value)} 
                              placeholder="Contact us to receive one" 
                            />
                            <p style={{ fontSize: "10px", color: "#888", margin: "2px 0 0 0" }}>
                              If provided, users viewing your surfaces will use this data for 3D assets.
                            </p>
                          </div>
                          <button 
                            onClick={handleUpdateProfile} 
                            style={{...activeTabBtn, backgroundColor: "#0b1b3d", padding: "8px", fontSize: "12px", marginTop: "5px"}}
                          >
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: "12px", color: "#555" }}>
                          <p style={{ margin: "0 0 5px 0" }}><strong>Username:</strong> {user.username}</p>
                          <p style={{ margin: "0 0 5px 0" }}><strong>Email:</strong> {user.email || <span style={{color: "#999"}}>Not provided</span>}</p>
                          <p style={{ margin: "0" }}><strong>Account Type:</strong> {user.is_premium ? "Premium Authority" : "Free User"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
      </main>
    );
}