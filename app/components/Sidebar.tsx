// @ts-nocheck
"use client";
import * as Cesium from "cesium";


export default function Sidebar(props: any) {
  const {
    activeTab,
    activeTabBtn,
    activeTool,
    addPbnLeg,
    adg,
    airportName,
    altUnit,
    analysisResult,
    API_BASE,
    apvBaroParams,
    apvParams,
    arcCode,
    arpAlt,
    autoFetchGeoidOffset,
    batchInput,
    batchResults,
    buildingsRef,
    cesiumContainer,
    clearTools,
    cOls,
    createBtnStyle,
    currentOwnerToken,
    customPoints,
    DEFAULT_ION_TOKEN,
    DESIGN_W,
    downloadBatchCSV,
    drawnSurfacesRef,
    editEmail,
    editIonToken,
    editPassword,
    editUsername,
    exaggeration,
    exagRef,
    expandedSurfaceId,
    family,
    forgotEmail,
    generateBatchPDF,
    generatePDF,
    genericColor,
    geoidOffset,
    getAuthHeaders,
    getCenterFromMap,
    getFirstCoord,
    getTrueMslAltitude,
    googleTilesRef,
    handleAuth,
    handleBatchAnalyze,
    handleBatchFileUpload,
    handleDefine,
    handleDeleteComponent,
    handleDeleteSurface,
    handleDownloadLogs,
    handleDrawSurface,
    handleExport,
    handleFileUpload,
    handleHeliPresetChange,
    handleLogout,
    handleSearch,
    handleSearchPublicSurfaces,
    handleSelectNavaid,
    handleSelectRunway,
    handleUpdateProfile,
    handleVpaOrTypeChange,
    heliParams,
    heliPreset,
    holdingParams,
    inactiveTabBtn,
    inputStyle,
    isAnalyzing,
    isAnalyzingBatch,
    isCreating,
    isDirectional,
    isEditingProfile,
    isForgotPassword,
    isGenericMode,
    isLoggingIn,
    isRegistering,
    isResending,
    isSearching,
    isSidebarOpen,
    isXRayMode,
    labelStyle,
    logEndDate,
    loginInput,
    logStartDate,
    manageAptName,
    manageAptPublic,
    manageAptSelect,
    measureResult,
    mounted,
    navBearing,
    navCoord,
    navThr,
    navType,
    newPassword,
    numInputStyle,
    oasParams,
    obsPos,
    passwordInput,
    pbnParams,
    pointResult,
    pubSurfQuery,
    pubSurfResults,
    registerEmail,
    removePbnLeg,
    resendEmailInput,
    resetToken,
    rnavMode,
    rnavOverrides,
    rnavParams,
    rowStyle,
    rulerPts,
    runwayType,
    savedSurfaces,
    scaledH,
    searchQuery,
    searchResults,
    selectedAnalysisAirport,
    selectedAnalysisOwner,
    selectingPbnArc,
    selectingPbnLeg,
    selectingRnavPoint,
    setActiveTab,
    setActiveTool,
    setAdg,
    setAirportName,
    setAltUnit,
    setAnalysisResult,
    setApvBaroParams,
    setApvParams,
    setArcCode,
    setArpAlt,
    setBatchInput,
    setBatchResults,
    setCOls,
    setCurrentOwnerToken,
    setCustomPoints,
    setEditEmail,
    setEditIonToken,
    setEditPassword,
    setEditUsername,
    setExaggeration,
    setExpandedSurfaceId,
    setFamily,
    setForgotEmail,
    setGeoidOffset,
    setHeliParams,
    setHeliPreset,
    setHoldingParams,
    setIsAnalyzing,
    setIsAnalyzingBatch,
    setIsCreating,
    setIsEditingProfile,
    setIsForgotPassword,
    setIsGenericMode,
    setIsLoggingIn,
    setIsRegistering,
    setIsResending,
    setIsSearching,
    setIsSidebarOpen,
    setIsXRayMode,
    setLogEndDate,
    setLoginInput,
    setLogStartDate,
    setManageAptName,
    setManageAptPublic,
    setManageAptSelect,
    setMeasureResult,
    setMounted,
    setNavBearing,
    setNavCoord,
    setNavThr,
    setNavType,
    setNewPassword,
    setOasParams,
    setObsPos,
    setPasswordInput,
    setPbnParams,
    setPointResult,
    setPubSurfQuery,
    setPubSurfResults,
    setRegisterEmail,
    setResendEmailInput,
    setResetToken,
    setRnavMode,
    setRnavOverrides,
    setRnavParams,
    setRulerPts,
    setRunwayType,
    setSavedSurfaces,
    setScaledH,
    setSearchQuery,
    setSearchResults,
    setSelectedAnalysisAirport,
    setSelectedAnalysisOwner,
    setSelectingPbnArc,
    setSelectingPbnLeg,
    setSelectingRnavPoint,
    setShowAccountPanel,
    setShowBuildings,
    setShowGoogleTiles,
    setShowTools,
    setSurfName,
    setT1,
    setT2,
    setToast,
    setToolTip,
    setUseCustomRnav,
    setUser,
    setVertiportParams,
    setVpScale,
    setVssParams,
    setWsParams,
    showAccountPanel,
    showBuildings,
    showGoogleTiles,
    showToast,
    showTools,
    sidebarStyle,
    surfName,
    t1,
    t2,
    theme,
    toast,
    toolsDataSourceRef,
    toolTip,
    updatePbnLeg,
    useCustomRnav,
    user,
    vertiportParams,
    viewerRef,
    vpScale,
    vssParams,
    wsParams,
  } = props;

  return (
<div style={{
          ...sidebarStyle,
          left: isSidebarOpen ? "20px" : "-400px",
          transition: "left 0.3s ease-in-out"
        }}>
          
          {/* VISUALIZATION TOGGLES */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", display: "flex", gap: "6px", alignItems: "center", color: theme.text, cursor: "pointer" }}>
              <input type="checkbox" checked={isXRayMode} onChange={e => setIsXRayMode(e.target.checked)} />
              X-Ray Mode (See surfaces through terrain)
            </label>
            <label style={{ fontSize: "12px", display: "flex", gap: "6px", alignItems: "center", color: theme.text, cursor: "pointer" }}>
              <input type="checkbox" checked={isGenericMode} onChange={e => setIsGenericMode(e.target.checked)} />
              Generic Color Surfaces
            </label>
            {/* --- 3D Buildings Checkbox --- */}
            <label
              style={{
                fontSize: "12px", display: "flex", alignItems: "center", gap: "6px",
                color: user?.is_premium ? theme.text : theme.textMuted,
                cursor: user?.is_premium ? "pointer" : "not-allowed"
              }}
              title={!user?.is_premium ? "Upgrade to Premium to view 3D buildings" : ""}
            >
              <input
                type="checkbox"
                checked={showBuildings}
                onChange={e => setShowBuildings(e.target.checked)}
                disabled={!user?.is_premium}
              />
              3D Buildings {!user?.is_premium && <span style={{ color: "gold" }}>★</span>}
            </label>
          </div>

          {/* TAB NAVIGATION (Modern Segmented Control) */}
          <div className="segmented-control">
            <button className={`segmented-btn ${activeTab === "define" ? "active" : ""}`} onClick={() => setActiveTab("define")}>DEFINE</button>
            <button className={`segmented-btn ${activeTab === "analyze" ? "active" : ""}`} onClick={() => setActiveTab("analyze")}>ANALYZE</button>
            <button className={`segmented-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>DASHBOARD</button>
          </div>

          {/* --- DEFINE TAB --- */}
          {activeTab === "define" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* --- OPEN SOURCE SEARCH --- */}
              <div style={{ backgroundColor: theme.lightBlue, padding: "12px", borderRadius: theme.radiusSm, border: "1px solid #cce5ff", position: "relative" }}>
                <input
                  style={inputStyle}
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder={family === "NAVAID" ? "🔍 Search Navaid (e.g. JFK)" : "🔍 Search Airport (e.g. EGLL)"}
                  onBlur={() => setTimeout(() => {
                    setSearchResults([]);
                    setSearchQuery("");
                  }, 200)}
                />

                {/* SEARCH RESULTS DROPDOWN */}
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: theme.bg,
                  border: `1px solid ${theme.border}`, zIndex: 9999, maxHeight: "300px", overflowY: "auto",
                  boxShadow: theme.shadowHover, borderRadius: theme.radiusSm, marginTop: "4px"
                }}>
                  {family === "NAVAID" ? (
                    searchResults.map((nav, idx) => (
                      <div key={idx} onClick={() => handleSelectNavaid(nav)} style={{ padding: "10px", borderBottom: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "13px" }}>
                        <strong style={{ color: theme.navy }}>{nav.ident}</strong> - <span style={{ color: theme.text }}>{nav.name}</span> <span style={{ color: theme.textMuted }}>({nav.type})</span>
                      </div>
                    ))
                  ) : (
                    searchResults.map((apt, idx) => (
                      <div key={idx} style={{ padding: "10px", borderBottom: `1px solid ${theme.border}`, fontSize: "13px" }}>
                        <strong style={{ color: theme.navy }}>{apt.ident}</strong> - <span style={{ color: theme.text }}>{apt.name}</span>
                        <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {apt.runways && apt.runways.length > 0 ? (
                            apt.runways.map((rwy: any, rIdx: number) => (
                              <button
                                key={rIdx}
                                onClick={() => handleSelectRunway(apt, rwy)}
                                style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                              >
                                RWY {rwy.le_ident}/{rwy.he_ident}
                              </button>
                            ))
                          ) : (
                            <button
                              onClick={() => handleSelectRunway(apt)}
                              style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "#15803d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
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

              <div>
                <label style={labelStyle}>Airport / Group Name</label>
                <input style={inputStyle} value={airportName} onChange={e => setAirportName(e.target.value)} placeholder="e.g. Heathrow (EGLL)" />
              </div>

              <div>
                <label style={labelStyle}>Surface Name <span style={{color: theme.textMuted, fontWeight: "normal", textTransform: "none"}}>(Optional)</span></label>
                <input style={inputStyle} value={surfName} onChange={e => setSurfName(e.target.value)} placeholder="e.g., RWY 09/27" />
              </div>

              <div>
                <label style={labelStyle}>Surface Family</label>
                <select style={inputStyle} value={family} onChange={e => setFamily(e.target.value)}>
                  <option value="OLS">OLS (Annex 14)</option>
                  <option value="RNAV">RNAV / RNP APCH (Straight MA only)</option>
                  <option value="VSS">VSS</option>
                  <option value="OAS">OAS (ILS)</option>
                  <option value="APV_BARO">OAS (APV Baro-VNAV)</option>
                  <option value="OFZ">OFZ / OES</option>
                  <option value="NAVAID">Navaid BRA</option>
                  <option value="CUSTOM">Import custom Surfaces</option>
                  <option value="HELIPORT">Heliport OLS</option>
                  <option value="VERTIPORT">Vertiport OVS (EASA PTS) In progress</option>
                  {/* --- <option value="PBN">PBN Segments - In progress</option> --- */}
                </select>
              </div>

              {/* --- ONLY SHOW T1, T2, and ARP for Aeroplane OLS, OFZ, VSS, and OAS --- */}
              {(family === "OLS" || family === "OFZ" || family === "VSS" || family === "OAS" || family === "APV_BARO") && (
                <div style={{ backgroundColor: theme.bgOff, padding: "12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                  
                  {family === "OAS" && (
                    <div style={{ fontSize: "11px", color: theme.navy, backgroundColor: theme.lightBlue, padding: "8px", borderRadius: "4px", border: "1px solid #b3d9f7", lineHeight: "1.5" }}>
                      <strong>T1</strong> = ILS Approach Threshold (origin).<br/><strong>T2</strong> = Runway Stop-End.<br/>Coordinate system derives approach bearing and length from T1→T2.
                    </div>
                  )}

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{...labelStyle, marginTop: 0}}>Threshold 1 (Lat / Lon / Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setT1, t1)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={t1.lat} onChange={e => setT1({ ...t1, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={t1.lon} onChange={e => setT1({ ...t1, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={t1.alt} onChange={e => setT1({ ...t1, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                      <label style={{...labelStyle, marginTop: 0}}>Threshold 2 (Lat / Lon / Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setT2, t2)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={t2.lat} onChange={e => setT2({ ...t2, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={t2.lon} onChange={e => setT2({ ...t2, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={t2.alt} onChange={e => setT2({ ...t2, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>
                  </div>

                  <div>
                    <label style={{...labelStyle, marginTop: 0}}>ARP Altitude (m)</label>
                    <input style={inputStyle} type="number" value={arpAlt} onChange={e => setArpAlt(+e.target.value)} />
                  </div>
                </div>
              )}

              {/* NEW RUNWAY TYPE DROPDOWN (Only show for OFZ) */}
              {(family === "OFZ") && (
                <div>
                  <label style={labelStyle}>Runway Type</label>
                  <select style={inputStyle} value={runwayType} onChange={e => setRunwayType(e.target.value)}>
                    <option value="non_instrument">Non-Instrument</option>
                    <option value="non_precision">Non-Precision Approach</option>
                    <option value="precision">Precision Approach</option>
                  </select>
                </div>
              )}

              {/* --- STANDARD OLS SETTINGS --- */}
              {family === "OLS" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{...labelStyle, marginTop: 0}}>Runway Type</label>
                      <select style={inputStyle} value={runwayType} onChange={e => setRunwayType(e.target.value)}>
                        <option value="non_instrument">Non-Instrument</option>
                        <option value="non_precision">Non-Precision</option>
                        <option value="precision">Precision</option>
                        <option value="custom">⚙️ Custom</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{...labelStyle, marginTop: 0}}>ARC Override</label>
                      <select style={inputStyle} value={arcCode} onChange={e => setArcCode(e.target.value)}>
                        <option value="Auto">Auto</option>
                        <option value="1">Code 1</option>
                        <option value="2">Code 2</option>
                        <option value="3">Code 3</option>
                        <option value="4">Code 4</option>
                      </select>
                    </div>
                  </div>

                  {/* --- NEW: CUSTOM OLS CONFIGURATOR --- */}
                  {runwayType === "custom" && (
                    <div style={{ backgroundColor: "#e2e8f0", padding: "10px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                      <p style={{ fontSize: "12px", color: theme.navy, margin: "0 0 4px 0", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Custom Parameters
                      </p>

                      {/* Helper functions to keep UI code incredibly clean and perfectly sized */}
                      {(() => {
                        const ParamInput = ({ label, value, onChange }: any) => (
                          <div style={{ display: "flex", flexDirection: "column", width: "65px" }}>
                            <span style={{ fontSize: "10px", color: theme.textMuted, marginBottom: "2px", fontWeight: "bold", whiteSpace: "nowrap" }}>{label}</span>
                            <input
                              type="number"
                              style={{ padding: "6px", fontSize: "12px", borderRadius: "4px", border: `1px solid ${theme.border}`, width: "100%", boxSizing: "border-box", backgroundColor: "#fff", color: theme.text }}
                              value={value}
                              onChange={onChange}
                            />
                          </div>
                        );

                        const CustomRow = ({ label, toggle, inputs }: any) => (
                          <div style={{ display: "flex", flexDirection: "column", padding: "10px", backgroundColor: cOls[toggle as keyof typeof cOls] ? "#ffffff" : theme.bgOff, borderRadius: "4px", border: `1px solid ${theme.border}`, transition: "all 0.2s" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: cOls[toggle as keyof typeof cOls] ? "8px" : "0" }}>
                              <input type="checkbox" checked={cOls[toggle as keyof typeof cOls] as boolean} onChange={(e) => setCOls({ ...cOls, [toggle]: e.target.checked })} style={{ cursor: "pointer" }} />
                              <strong style={{ fontSize: "12px", color: cOls[toggle as keyof typeof cOls] ? theme.navy : theme.textMuted }}>{label}</strong>
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
                                <ParamInput label="End Dist." value={cOls.strip_end} onChange={(e: any) => setCOls({ ...cOls, strip_end: +e.target.value })} />
                                <ParamInput label="Width (m)" value={cOls.strip_width} onChange={(e: any) => setCOls({ ...cOls, strip_width: +e.target.value })} />
                              </>
                            } />
                            {/* ... (The rest of your custom inputs are fine as they are, just inheriting the modern style) ... */}
                            <CustomRow label="Approach Surface" toggle="draw_app" inputs={
                              <>
                                <ParamInput label="Div. (%)" value={cOls.app_div} onChange={(e: any) => setCOls({ ...cOls, app_div: +e.target.value })} />
                                <div style={{ width: "1px", backgroundColor: "#ddd", margin: "0 4px" }}></div>
                                <ParamInput label="Sec 1 Len" value={cOls.app_s1_len} onChange={(e: any) => setCOls({ ...cOls, app_s1_len: +e.target.value })} />
                                <ParamInput label="Sec 1 Slope" value={cOls.app_s1_slope} onChange={(e: any) => setCOls({ ...cOls, app_s1_slope: +e.target.value })} />
                                <div style={{ width: "1px", backgroundColor: "#ddd", margin: "0 4px" }}></div>
                                <ParamInput label="Sec 2 Len" value={cOls.app_s2_len} onChange={(e: any) => setCOls({ ...cOls, app_s2_len: +e.target.value })} />
                                <ParamInput label="Sec 2 Slope" value={cOls.app_s2_slope} onChange={(e: any) => setCOls({ ...cOls, app_s2_slope: +e.target.value })} />
                                <div style={{ width: "1px", backgroundColor: "#ddd", margin: "0 4px" }}></div>
                                <ParamInput label="Sec 3 Len" value={cOls.app_s3_len} onChange={(e: any) => setCOls({ ...cOls, app_s3_len: +e.target.value })} />
                                <ParamInput label="Sec 3 Slope" value={cOls.app_s3_slope} onChange={(e: any) => setCOls({ ...cOls, app_s3_slope: +e.target.value })} />
                              </>
                            } />
                            <CustomRow label="Take-off Climb Surface" toggle="draw_dep" inputs={
                              <>
                                <ParamInput label="Start Offset" value={cOls.dep_start} onChange={(e: any) => setCOls({ ...cOls, dep_start: +e.target.value })} />
                                <ParamInput label="Inner W." value={cOls.dep_inner} onChange={(e: any) => setCOls({ ...cOls, dep_inner: +e.target.value })} />
                                <ParamInput label="Max W." value={cOls.dep_max_w} onChange={(e: any) => setCOls({ ...cOls, dep_max_w: +e.target.value })} />
                                <ParamInput label="Div. (%)" value={cOls.dep_div} onChange={(e: any) => setCOls({ ...cOls, dep_div: +e.target.value })} />
                                <ParamInput label="Length (m)" value={cOls.dep_len} onChange={(e: any) => setCOls({ ...cOls, dep_len: +e.target.value })} />
                                <ParamInput label="Slope (%)" value={cOls.dep_slope} onChange={(e: any) => setCOls({ ...cOls, dep_slope: +e.target.value })} />
                              </>
                            } />
                            <CustomRow label="Transitional Surface" toggle="draw_trans" inputs={
                              <ParamInput label="Slope (%)" value={cOls.trans_slope} onChange={(e: any) => setCOls({ ...cOls, trans_slope: +e.target.value })} />
                            } />
                            <CustomRow label="Inner Horizontal Surface" toggle="draw_ihs" inputs={
                              <>
                                <ParamInput label="Radius (m)" value={cOls.ihs_radius} onChange={(e: any) => setCOls({ ...cOls, ihs_radius: +e.target.value })} />
                                <ParamInput label="Override (Alt)" value={cOls.ihs_alt_override} onChange={(e: any) => setCOls({ ...cOls, ihs_alt_override: e.target.value === "" ? "" : +e.target.value })} />
                              </>
                            } />
                            <CustomRow label="Conical Surface" toggle="draw_conical" inputs={
                              <>
                                <ParamInput label="Height (m)" value={cOls.conical_height} onChange={(e: any) => setCOls({ ...cOls, conical_height: +e.target.value })} />
                                <ParamInput label="Slope (%)" value={cOls.conical_slope} onChange={(e: any) => setCOls({ ...cOls, conical_slope: +e.target.value })} />
                              </>
                            } />
                            <CustomRow label="Balked Landing Surface" toggle="draw_balked" inputs={
                              <>
                                <ParamInput label="Start Offset" value={cOls.balked_start} onChange={(e: any) => setCOls({ ...cOls, balked_start: +e.target.value })} />
                                <ParamInput label="Div. (%)" value={cOls.balked_div} onChange={(e: any) => setCOls({ ...cOls, balked_div: +e.target.value })} />
                                <ParamInput label="Slope (%)" value={cOls.balked_slope} onChange={(e: any) => setCOls({ ...cOls, balked_slope: +e.target.value })} />
                              </>
                            } />
                            <CustomRow label="Inner Approach Surface" toggle="draw_in_app" inputs={
                              <>
                                <ParamInput label="Offset" value={cOls.in_app_offset} onChange={(e: any) => setCOls({ ...cOls, in_app_offset: +e.target.value })} />
                                <ParamInput label="Half-W (m)" value={cOls.in_app_hw} onChange={(e: any) => setCOls({ ...cOls, in_app_hw: +e.target.value })} />
                                <ParamInput label="Length (m)" value={cOls.in_app_len} onChange={(e: any) => setCOls({ ...cOls, in_app_len: +e.target.value })} />
                                <ParamInput label="Slope (%)" value={cOls.in_app_slope} onChange={(e: any) => setCOls({ ...cOls, in_app_slope: +e.target.value })} />
                              </>
                            } />
                            <CustomRow label="Inner Transitional" toggle="draw_in_trans" inputs={<span style={{ fontSize: "11px", color: theme.textMuted, marginTop: "4px" }}>Derived from Inner Approach & Strip settings.</span>} />
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
              {/* DYNAMIC HELIPORT FIELDS */}
              {family === "HELIPORT" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "16px", borderRadius: theme.radiusSm, display: "flex", flexDirection: "column", gap: "12px", border: `1px solid ${theme.border}` }}>

                  {/* TYPE & PRESET */}
                  <div style={{ display: "flex", gap: "10px", paddingBottom: "12px", borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...labelStyle, marginTop: 0 }}>FATO Type</label>
                      <select style={inputStyle} value={heliParams.fatoType} onChange={e => { setHeliParams({ ...heliParams, fatoType: e.target.value }); setHeliPreset("custom"); }}>
                        <option value="non_instrument">Non-Instrument</option>
                        <option value="non_precision">Non-Precision Approach</option>
                        <option value="precision">Precision Approach</option>
                      </select>
                    </div>
                    {heliParams.fatoType === "non_instrument" && (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", marginTop: "18px" }}>
                        <input type="checkbox" id="hasPinsVss" checked={heliParams.hasPinsVss} onChange={e => setHeliParams({ ...heliParams, hasPinsVss: e.target.checked })} style={{ cursor: "pointer" }} />
                        <label htmlFor="hasPinsVss" style={{ fontSize: "11px", fontWeight: "bold", color: theme.textMuted, cursor: "pointer", lineHeight: 1.2 }}>PinS + VSS<br/>(transitionals)</label>
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <label style={{ ...labelStyle, marginTop: 0 }}>Annex 14 Presets</label>
                      <select style={inputStyle} value={heliPreset} onChange={handleHeliPresetChange}>
                        <option value="custom">Custom Parameters</option>
                        <option value="cat_a">Slope Cat A (PC1)</option>
                        <option value="cat_b">Slope Cat B (PC3)</option>
                        <option value="cat_c">Slope Cat C (PC2)</option>
                        <option value="non_precision">Inst. Non-Precision</option>
                        <option value="precision">Inst. Precision</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{ ...labelStyle, marginTop: 0 }}>Heliport FATO Center (Lat / Lon / Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setHeliParams, heliParams)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={heliParams.lat} onChange={e => setHeliParams({ ...heliParams, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={heliParams.lon} onChange={e => setHeliParams({ ...heliParams, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={heliParams.alt} onChange={e => setHeliParams({ ...heliParams, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>
                  </div>

                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Take-off Bearing (°)</label>
                      <input style={inputStyle} type="number" value={heliParams.bearing} onChange={e => setHeliParams({ ...heliParams, bearing: +e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Safety Area W. (m)</label>
                      <input style={inputStyle} type="number" value={heliParams.innerWidth} onChange={e => setHeliParams({ ...heliParams, innerWidth: +e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Start Offset (m)</label>
                      <input style={inputStyle} type="number" value={heliParams.startOffset} onChange={e => setHeliParams({ ...heliParams, startOffset: +e.target.value })} />
                    </div>
                  </div>

                  {/* MULTI-SECTION BUILDER */}
                  <div style={{ backgroundColor: theme.bg, padding: "10px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                    <label style={{ ...labelStyle, marginTop: 0, color: "#15803d" }}>Approach Surface (Inbound)</label>
                    <div style={{ display: "flex", gap: "5px", fontSize: "10px", fontWeight: "bold", color: theme.textMuted, marginBottom: "4px" }}>
                      <span style={{ flex: 1 }}>Section</span><span style={{ flex: 1 }}>Length (m)</span><span style={{ flex: 1 }}>Slope (%)</span><span style={{ flex: 1 }}>Div (%)</span><span style={{ flex: 1 }}>MaxW (m)</span>
                    </div>
                    {[
                      { id: 1, lbl: "1 (Inner)", len: heliParams.appS1Len, slp: heliParams.appS1Slope, div: heliParams.appS1Div, max: heliParams.appS1MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) },
                      { id: 2, lbl: "2 (Mid)", len: heliParams.appS2Len, slp: heliParams.appS2Slope, div: heliParams.appS2Div, max: heliParams.appS2MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) },
                      { id: 3, lbl: "3 (Outer)", len: heliParams.appS3Len, slp: heliParams.appS3Slope, div: heliParams.appS3Div, max: heliParams.appS3MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) }
                    ].map(sec => (
                      <div key={sec.id} style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                        <span style={{ flex: 1, fontSize: "11px", alignSelf: "center", fontWeight: 600, color: theme.navy }}>{sec.lbl}</span>
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.len} onChange={e => { sec.set({ [`appS${sec.id}Len`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.slp} onChange={e => { sec.set({ [`appS${sec.id}Slope`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.div} onChange={e => { sec.set({ [`appS${sec.id}Div`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" placeholder="—" value={sec.max ?? ""} onChange={e => { sec.set({ [`appS${sec.id}MaxW`]: e.target.value ? +e.target.value : null }); setHeliPreset("custom"); }} />
                      </div>
                    ))}
                  </div>

                  <div style={{ backgroundColor: theme.bg, padding: "10px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                    <label style={{ ...labelStyle, marginTop: 0, color: "#b91c1c" }}>Take-off Climb Surface (Outbound)</label>
                    <div style={{ display: "flex", gap: "5px", fontSize: "10px", fontWeight: "bold", color: theme.textMuted, marginBottom: "4px" }}>
                      <span style={{ flex: 1 }}>Section</span><span style={{ flex: 1 }}>Length (m)</span><span style={{ flex: 1 }}>Slope (%)</span><span style={{ flex: 1 }}>Div (%)</span><span style={{ flex: 1 }}>MaxW (m)</span>
                    </div>
                    {[
                      { id: 1, lbl: "1 (Inner)", len: heliParams.tkofS1Len, slp: heliParams.tkofS1Slope, div: heliParams.tkofS1Div, max: heliParams.tkofS1MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) },
                      { id: 2, lbl: "2 (Mid)", len: heliParams.tkofS2Len, slp: heliParams.tkofS2Slope, div: heliParams.tkofS2Div, max: heliParams.tkofS2MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) },
                      { id: 3, lbl: "3 (Outer)", len: heliParams.tkofS3Len, slp: heliParams.tkofS3Slope, div: heliParams.tkofS3Div, max: heliParams.tkofS3MaxW, set: (v: any) => setHeliParams({ ...heliParams, ...v }) }
                    ].map(sec => (
                      <div key={sec.id} style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                        <span style={{ flex: 1, fontSize: "11px", alignSelf: "center", fontWeight: 600, color: theme.navy }}>{sec.lbl}</span>
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.len} onChange={e => { sec.set({ [`tkofS${sec.id}Len`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.slp} onChange={e => { sec.set({ [`tkofS${sec.id}Slope`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" value={sec.div} onChange={e => { sec.set({ [`tkofS${sec.id}Div`]: +e.target.value }); setHeliPreset("custom"); }} />
                        <input style={{ ...numInputStyle, padding: "6px", fontSize: "13px" }} type="number" placeholder="—" value={sec.max ?? ""} onChange={e => { sec.set({ [`tkofS${sec.id}MaxW`]: e.target.value ? +e.target.value : null }); setHeliPreset("custom"); }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DYNAMIC VERTIPORT FIELDS */}
              {family === "VERTIPORT" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "16px", borderRadius: theme.radiusSm, display: "flex", flexDirection: "column", gap: "12px", border: `1px solid ${theme.border}` }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{ ...labelStyle, marginTop: 0 }}>Vertiport Centroid (Lat / Lon / Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setVertiportParams, vertiportParams)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={vertiportParams.lat} onChange={e => setVertiportParams({ ...vertiportParams, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={vertiportParams.lon} onChange={e => setVertiportParams({ ...vertiportParams, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={vertiportParams.alt} onChange={e => setVertiportParams({ ...vertiportParams, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>
                  </div>

                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Take-off Bearing (°)</label>
                      <input style={inputStyle} type="number" value={vertiportParams.bearing} onChange={e => setVertiportParams({ ...vertiportParams, bearing: +e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>FATO Width (m)</label>
                      <input style={inputStyle} type="number" value={vertiportParams.fato_width} onChange={e => setVertiportParams({ ...vertiportParams, fato_width: +e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>FATO Length (m)</label>
                      <input style={inputStyle} type="number" value={vertiportParams.fato_length} onChange={e => setVertiportParams({ ...vertiportParams, fato_length: +e.target.value })} />
                    </div>
                  </div>

                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Safety Area W. (m)</label>
                      <input style={inputStyle} type="number" value={vertiportParams.sa_width} onChange={e => setVertiportParams({ ...vertiportParams, sa_width: +e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Safety Area L. (m)</label>
                      <input style={inputStyle} type="number" value={vertiportParams.sa_length} onChange={e => setVertiportParams({ ...vertiportParams, sa_length: +e.target.value })} />
                    </div>
                  </div>

                  <div style={{ backgroundColor: theme.bg, padding: "10px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                    <label style={{ ...labelStyle, marginTop: 0, color: "#15803d" }}>Approach Surface (Inbound)</label>
                    {[1, 2].map(id => {
                      const isC = vertiportParams[`appS${id}Curved`];
                      return (
                        <div key={`app-${id}`} style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px", padding: "8px", backgroundColor: theme.bgOff, borderRadius: "4px", border: `1px solid ${theme.border}` }}>
                          <div style={{ display: "flex", gap: "5px" }}>
                            <span style={{ flex: 0.5, fontSize: "11px", alignSelf: "center", fontWeight: 600, color: theme.navy }}>Sec {id}</span>
                            <input style={{ ...numInputStyle, padding: "6px", fontSize: "12px", width: "40px" }} type="number" placeholder="Len" value={vertiportParams[`appS${id}Len`]} onChange={e => setVertiportParams({ ...vertiportParams, [`appS${id}Len`]: +e.target.value })} disabled={isC} title={isC ? "Length is auto-calculated for curves" : "Length (m)"} />
                            <input style={{ ...numInputStyle, padding: "6px", fontSize: "12px", width: "40px" }} type="number" placeholder="Slp %" value={vertiportParams[`appS${id}Slope`]} onChange={e => setVertiportParams({ ...vertiportParams,[`appS${id}Slope`]: +e.target.value })} title="Slope %" />
                            <input style={{ ...numInputStyle, padding: "6px", fontSize: "12px", width: "40px" }} type="number" placeholder="Div %" value={vertiportParams[`appS${id}Div`]} onChange={e => setVertiportParams({ ...vertiportParams,[`appS${id}Div`]: +e.target.value })} title="Divergence %" />
                            
                            <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", color: theme.navy, fontWeight: "bold" }}>
                              <input type="checkbox" checked={isC} onChange={e => setVertiportParams({ ...vertiportParams,[`appS${id}Curved`]: e.target.checked })} /> Curve
                            </label>
                          </div>
                          
                          {isC && (
                            <div style={{ display: "flex", gap: "5px", paddingLeft: "35px", marginTop: "4px" }}>
                              <input style={{ ...numInputStyle, padding: "6px", fontSize: "12px", flex: 1 }} type="number" placeholder="Rad" value={vertiportParams[`appS${id}CurveRad`]} onChange={e => setVertiportParams({ ...vertiportParams, [`appS${id}CurveRad`]: +e.target.value })} title="Turn Radius (m)" />
                              <input style={{ ...numInputStyle, padding: "6px", fontSize: "12px", flex: 1 }} type="number" placeholder="Ang" value={vertiportParams[`appS${id}CurveAng`]} onChange={e => setVertiportParams({ ...vertiportParams, [`appS${id}CurveAng`]: +e.target.value })} title="Turn Angle (°)" />
                              <select style={{ ...numInputStyle, padding: "6px", fontSize: "12px", flex: 1 }} value={vertiportParams[`appS${id}CurveDir`]} onChange={e => setVertiportParams({ ...vertiportParams,[`appS${id}CurveDir`]: e.target.value })} title="Turn Direction">
                                <option value="R">Right</option>
                                <option value="L">Left</option>
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ backgroundColor: theme.bg, padding: "10px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                    <label style={{ ...labelStyle, marginTop: 0, color: "#b91c1c" }}>Take-off Climb Surface (Outbound)</label>
                    {[1, 2].map(id => {
                      const isC = vertiportParams[`tkofS${id}Curved`];
                      return (
                        <div key={`tkof-${id}`} style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px", padding: "8px", backgroundColor: theme.bgOff, borderRadius: "4px", border: `1px solid ${theme.border}` }}>
                          <div style={{ display: "flex", gap: "5px" }}>
                            <span style={{ flex: 0.5, fontSize: "11px", alignSelf: "center", fontWeight: 600, color: theme.navy }}>Sec {id}</span>
                            <input style={{ ...numInputStyle, padding: "6px", fontSize: "12px", width: "40px" }} type="number" placeholder="Len" value={vertiportParams[`tkofS${id}Len`]} onChange={e => setVertiportParams({ ...vertiportParams,[`tkofS${id}Len`]: +e.target.value })} disabled={isC} title={isC ? "Length is auto-calculated for curves" : "Length (m)"} />
                            <input style={{ ...numInputStyle, padding: "6px", fontSize: "12px", width: "40px" }} type="number" placeholder="Slp %" value={vertiportParams[`tkofS${id}Slope`]} onChange={e => setVertiportParams({ ...vertiportParams,[`tkofS${id}Slope`]: +e.target.value })} title="Slope %" />
                            <input style={{ ...numInputStyle, padding: "6px", fontSize: "12px", width: "40px" }} type="number" placeholder="Div %" value={vertiportParams[`tkofS${id}Div`]} onChange={e => setVertiportParams({ ...vertiportParams,[`tkofS${id}Div`]: +e.target.value })} title="Divergence %" />
                            
                            <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", color: theme.navy, fontWeight: "bold" }}>
                              <input type="checkbox" checked={isC} onChange={e => setVertiportParams({ ...vertiportParams,[`tkofS${id}Curved`]: e.target.checked })} /> Curve
                            </label>
                          </div>
                          
                          {isC && (
                            <div style={{ display: "flex", gap: "5px", paddingLeft: "35px", marginTop: "4px" }}>
                              <input style={{ ...numInputStyle, padding: "6px", fontSize: "12px", flex: 1 }} type="number" placeholder="Rad" value={vertiportParams[`tkofS${id}CurveRad`]} onChange={e => setVertiportParams({ ...vertiportParams, [`tkofS${id}CurveRad`]: +e.target.value })} title="Turn Radius (m)" />
                              <input style={{ ...numInputStyle, padding: "6px", fontSize: "12px", flex: 1 }} type="number" placeholder="Ang" value={vertiportParams[`tkofS${id}CurveAng`]} onChange={e => setVertiportParams({ ...vertiportParams, [`tkofS${id}CurveAng`]: +e.target.value })} title="Turn Angle (°)" />
                              <select style={{ ...numInputStyle, padding: "6px", fontSize: "12px", flex: 1 }} value={vertiportParams[`tkofS${id}CurveDir`]} onChange={e => setVertiportParams({ ...vertiportParams, [`tkofS${id}CurveDir`]: e.target.value })} title="Turn Direction">
                                <option value="R">Right</option>
                                <option value="L">Left</option>
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- OAS ICAO CONFIGURATOR --- */}
              {family === "OAS" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px", padding: "14px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  
                  {/* NAVAID DATA */}
                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Navigation Aid Data</strong>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1.5 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Approach Cat</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={oasParams.appCat} onChange={e => setOasParams({ ...oasParams, appCat: e.target.value })}>
                          <option value="ILS CAT I">ILS CAT I</option>
                          <option value="ILS CAT II">ILS CAT II</option>
                          <option value="ILS CAT II (Autopilot)">ILS CAT II (Autopilot)</option>
                          <option value="APV SBAS I">APV SBAS I</option>
                          <option value="APV SBAS II">APV SBAS II</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>GP/VPA (°)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={oasParams.glidePath} onChange={e => setOasParams({ ...oasParams, glidePath: +e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>RDH (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={oasParams.rdh} onChange={e => setOasParams({ ...oasParams, rdh: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>LOC-THR (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={oasParams.locThrDist} onChange={e => setOasParams({ ...oasParams, locThrDist: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Course W. (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={oasParams.courseWidth} onChange={e => setOasParams({ ...oasParams, courseWidth: +e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* AIRCRAFT DATA */}
                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Aircraft Data</strong>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>M/App CG (%)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={oasParams.missedAppCG} onChange={e => setOasParams({ ...oasParams, missedAppCG: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Aircraft CAT</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={oasParams.acCategory} onChange={e => setOasParams({ ...oasParams, acCategory: e.target.value })}>
                          <option value="A">CAT A</option>
                          <option value="B">CAT B</option>
                          <option value="C">CAT C</option>
                          <option value="D">CAT D</option>
                          <option value="E">CAT E</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Wing Semi Span (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px", backgroundColor: oasParams.isStandard ? theme.bgOff : theme.bg }} value={oasParams.wingSemiSpan} onChange={e => setOasParams({ ...oasParams, wingSemiSpan: +e.target.value })} disabled={oasParams.isStandard} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>GP Wheel/Ant (m)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px", backgroundColor: oasParams.isStandard ? theme.bgOff : theme.bg }} value={oasParams.antennaHeight} onChange={e => setOasParams({ ...oasParams, antennaHeight: +e.target.value })} disabled={oasParams.isStandard} />
                      </div>
                      <label style={{ flex: 0.8, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold", paddingBottom: "8px", cursor: "pointer", color: theme.navy }}>
                        <input type="checkbox" checked={oasParams.isStandard} onChange={e => setOasParams({ ...oasParams, isStandard: e.target.checked })} style={{ cursor: "pointer" }} /> STD
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* --- APV BARO-VNAV CONFIGURATOR --- */}
              {family === "APV_BARO" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px", padding: "14px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>APV Baro-VNAV Data</strong>
                    
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>VPA (°)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.vpaDeg} onChange={e => setApvBaroParams({ ...apvBaroParams, vpaDeg: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>RDH (m)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.rdh} onChange={e => setApvBaroParams({ ...apvBaroParams, rdh: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>MACG (%)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.maGradientPct} onChange={e => setApvBaroParams({ ...apvBaroParams, maGradientPct: +e.target.value })} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>FAP Height (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.heightFap} onChange={e => setApvBaroParams({ ...apvBaroParams, heightFap: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Delta H (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.deltaH} onChange={e => setApvBaroParams({ ...apvBaroParams, deltaH: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Aero Elev (ft)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.aerodromeElevFt} onChange={e => setApvBaroParams({ ...apvBaroParams, aerodromeElevFt: +e.target.value })} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Acft Cat</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.acftCategory} onChange={e => setApvBaroParams({ ...apvBaroParams, acftCategory: e.target.value })}>
                          <option value="A">CAT A</option>
                          <option value="B">CAT B</option>
                          <option value="C">CAT C</option>
                          <option value="D">CAT D</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>FAF Dist (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.fafDist} onChange={e => setApvBaroParams({ ...apvBaroParams, fafDist: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>MAPt Dist (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={apvBaroParams.maptDist} onChange={e => setApvBaroParams({ ...apvBaroParams, maptDist: +e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* --- DYNAMIC PBN (RNAV/RNP) BUILDER --- */}
              {family === "PBN" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "14px", borderRadius: theme.radiusSm, display: "flex", flexDirection: "column", gap: "12px", border: `1px solid ${theme.border}`, marginTop: "10px" }}>
                  
                  {/* GLOBAL SETTINGS */}
                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label style={{...labelStyle, marginTop: 0}}>Procedure Type</label>
                      <select style={inputStyle} value={pbnParams.procedure_type} onChange={e => setPbnParams({...pbnParams, procedure_type: e.target.value})}>
                        <option value="Approach">Approach</option>
                        <option value="Enroute">En-route</option>
                        <option value="SID">SID (Departure)</option>
                        <option value="STAR">STAR (Arrival)</option>
                        <option value="Missed_approach">Missed Approach</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{...labelStyle, marginTop: 0}}>Nav Spec</label>
                      <select style={inputStyle} value={pbnParams.nav_spec} onChange={e => setPbnParams({...pbnParams, nav_spec: e.target.value})}>
                        <option value="RNP APCH">RNP APCH</option>
                        <option value="Advanced RNP">Advanced RNP</option>
                        <option value="RNAV 5">RNAV 5</option>
                        <option value="RNAV 1">RNAV 1</option>
                      </select>
                    </div>
                    <div style={{ flex: 0.5 }}>
                      <label style={{...labelStyle, marginTop: 0}}>Alt Unit</label>
                      <select style={inputStyle} value={pbnParams.alt_unit} onChange={e => setPbnParams({...pbnParams, alt_unit: e.target.value})}>
                        <option value="ft">Feet</option>
                        <option value="m">Meters</option>
                      </select>
                    </div>
                  </div>

                  {/* AIRCRAFT & DYNAMICS OVERRIDES */}
                  <div style={{ display: "flex", gap: "6px", backgroundColor: theme.bg, padding: "10px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                    <div style={{ flex: 0.8 }}>
                      <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Acft Cat</label>
                      <select style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={pbnParams.acft_cat} onChange={e => setPbnParams({...pbnParams, acft_cat: e.target.value})}>
                        <option value="A">CAT A</option>
                        <option value="B">CAT B</option>
                        <option value="C">CAT C</option>
                        <option value="D">CAT D</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Max IAS (kt)</label>
                      <input type="number" style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={pbnParams.ias_kt ?? ""} onChange={e => setPbnParams({...pbnParams, ias_kt: +e.target.value})} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Stab Time (s)</label>
                      <input type="number" step="0.5" style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={pbnParams.stabilization_time_s ?? ""} onChange={e => setPbnParams({...pbnParams, stabilization_time_s: +e.target.value})} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Wind (kt)</label>
                      <input type="number" style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={pbnParams.wind_speed_kt ?? ""} onChange={e => setPbnParams({...pbnParams, wind_speed_kt: +e.target.value})} />
                    </div>
                  </div>

                  <hr style={{ borderTop: `1px solid ${theme.border}`, margin: "4px 0" }} />

                  {/* DYNAMIC LEGS BUILDER */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "12px", color: theme.navy, textTransform: "uppercase", letterSpacing: "0.5px" }}>Path Terminators (Legs)</strong>
                      <button onClick={addPbnLeg} style={{ padding: "4px 10px", backgroundColor: "#15803d", color: "white", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>+ Add Leg</button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                    {pbnParams.legs.map((leg, idx) => {
                      const isTargetingWpt = selectingPbnLeg === leg.id;
                      const isTargetingArc = selectingPbnArc === leg.id;
                      
                      return (
                      <div key={leg.id} style={{ padding: "10px", backgroundColor: theme.bg, borderRadius: "6px", border: `1px solid ${theme.border}`, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        
                        {/* Row 1: Header & Terminator */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: theme.navy }}>#{idx + 1}</span>
                          
                          <select style={{...inputStyle, padding: "4px 8px", fontSize: "12px", width: "auto", fontWeight: "bold", color: theme.blue}} value={leg.terminator} onChange={e => updatePbnLeg(leg.id, "terminator", e.target.value)}>
                            <option value="IF">IF (Initial Fix)</option>
                            <option value="TF">TF (Track to Fix)</option>
                            <option value="RF">RF (Radius to Fix)</option>
                            <option value="CF">CF (Course to Fix)</option>
                            <option value="HM">HM (Holding Pattern)</option>
                          </select>
                          
                          <button onClick={() => removePbnLeg(leg.id)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: "14px", fontWeight: "bold", padding: 0 }} title="Remove Leg">✕</button>
                        </div>

                        {/* Row 2: Waypoint Coordinates */}
                        <div style={{ display: "flex", gap: "6px", marginBottom: leg.terminator === "RF" ? "8px" : "0" }}>
                          <input type="number" placeholder="Lat" style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={leg.lat ?? ""} onChange={e => updatePbnLeg(leg.id, "lat", +e.target.value)} />
                          <input type="number" placeholder="Lon" style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={leg.lon ?? ""} onChange={e => updatePbnLeg(leg.id, "lon", +e.target.value)} />
                          <input type="number" placeholder="Alt" style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={leg.alt ?? ""} onChange={e => updatePbnLeg(leg.id, "alt", +e.target.value)} title={`Altitude in ${pbnParams.alt_unit}`} />
                          
                          <button onClick={(e) => { e.stopPropagation(); setSelectingPbnLeg(isTargetingWpt ? null : leg.id); }} style={{ padding: "0 8px", backgroundColor: isTargetingWpt ? "#dc3545" : theme.navy, color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }} title="Pick Waypoint on map">
                            {isTargetingWpt ? "Cancel" : "📍 WPT"}
                          </button>
                        </div>

                        {/* Row 3: Arc Parameters (Only if RF) */}
                        {leg.terminator === "RF" && (
                          <div style={{ display: "flex", gap: "6px", padding: "8px", backgroundColor: theme.lightBlue, borderRadius: "4px", border: "1px dashed #b3d9f7" }}>
                            <select style={{...inputStyle, padding: "6px", fontSize: "12px", width: "60px"}} value={leg.turn_dir} onChange={e => updatePbnLeg(leg.id, "turn_dir", e.target.value)}>
                              <option value="R">Right Turn</option>
                              <option value="L">Left Turn</option>
                            </select>
                            <input type="number" placeholder="Center Lat" style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={leg.arc_center_lat ?? ""} onChange={e => updatePbnLeg(leg.id, "arc_center_lat", +e.target.value)} />
                            <input type="number" placeholder="Center Lon" style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={leg.arc_center_lon ?? ""} onChange={e => updatePbnLeg(leg.id, "arc_center_lon", +e.target.value)} />
                            
                            <button onClick={(e) => { e.stopPropagation(); setSelectingPbnArc(isTargetingArc ? null : leg.id); }} style={{ padding: "0 8px", backgroundColor: isTargetingArc ? "#dc3545" : "#0284c7", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }} title="Pick Arc Center on map">
                              {isTargetingArc ? "Cancel" : "📍 ARC"}
                            </button>
                          </div>
                        )}
                        
                        {/* Row 4: Tolerances */}
                        <div style={{ display: "flex", gap: "10px", marginTop: "8px", borderTop: `1px solid ${theme.border}`, paddingTop: "8px" }}>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "10px", color: theme.navy, fontWeight: "bold" }}>Primary Half-W (NM)</span>
                            <input type="number" step="0.1" style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={leg.primary_hw_nm} onChange={e => updatePbnLeg(leg.id, "primary_hw_nm", +e.target.value)} />
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "10px", color: theme.navy, fontWeight: "bold" }}>Secondary Half-W (NM)</span>
                            <input type="number" step="0.1" style={{...inputStyle, padding: "6px", fontSize: "12px"}} value={leg.secondary_hw_nm} onChange={e => updatePbnLeg(leg.id, "secondary_hw_nm", +e.target.value)} />
                          </div>
                          
                          <div style={{ flex: 0.8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "4px" }}>
                            <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                              Fly-Over
                              <input type="checkbox" checked={leg.is_flyover} onChange={e => updatePbnLeg(leg.id, "is_flyover", e.target.checked)} style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: theme.navy }} />
                            </label>
                          </div>
                        </div>

                      </div>
                      );
                    })}
                  </div>
                  
                  {/* --- CALCULATIONS VERIFICATION TABLE --- */}
                  {props.pbnCalculations && props.pbnCalculations.turns && props.pbnCalculations.segments && (
                    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: theme.bgOff, padding: "12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                      <h4 style={{ margin: 0, fontSize: "12px", color: theme.navy }}>Turn Parameters (PANS-OPS Math)</h4>
                      <table style={{ width: "100%", fontSize: "10px", borderCollapse: "collapse", color: theme.text }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${theme.border}`, textAlign: "left" }}>
                            <th style={{ paddingBottom: "4px" }}>Fix</th>
                            <th style={{ paddingBottom: "4px" }}>Turn</th>
                            <th style={{ paddingBottom: "4px" }}>Rad (R)</th>
                            <th style={{ paddingBottom: "4px" }}>W. Rad</th>
                            <th style={{ paddingBottom: "4px" }}>ETP (m)</th>
                            <th style={{ paddingBottom: "4px" }}>LTP (m)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {props.pbnCalculations.turns.map((t: any, i: number) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                              <td style={{ padding: "4px 0", fontWeight: "bold" }}>{t.fix}</td>
                              <td style={{ padding: "4px 0" }}>{t.turn_angle_deg}°</td>
                              <td style={{ padding: "4px 0" }}>{t.radius_m}</td>
                              <td style={{ padding: "4px 0" }}>{t.wind_radius_m}</td>
                              <td style={{ padding: "4px 0", color: "#c53030" }}>{t.etp_m}</td>
                              <td style={{ padding: "4px 0" }}>{t.ltp_m}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      <h4 style={{ margin: 0, fontSize: "12px", color: theme.navy, marginTop: "8px" }}>Segment Validation (MSD)</h4>
                      <table style={{ width: "100%", fontSize: "10px", borderCollapse: "collapse", color: theme.text }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${theme.border}`, textAlign: "left" }}>
                            <th style={{ paddingBottom: "4px" }}>Segment</th>
                            <th style={{ paddingBottom: "4px" }}>Avail (m)</th>
                            <th style={{ paddingBottom: "4px" }}>Req (m)</th>
                            <th style={{ paddingBottom: "4px" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {props.pbnCalculations.segments.map((s: any, i: number) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                              <td style={{ padding: "4px 0", fontWeight: "bold" }}>{s.from_fix} ➔ {s.to_fix}</td>
                              <td style={{ padding: "4px 0" }}>{s.dist_avail_m}</td>
                              <td style={{ padding: "4px 0" }}>{s.dist_req_m}</td>
                              <td style={{ padding: "4px 0", color: s.msd_passed ? "#15803d" : "#c53030", fontWeight: "bold" }}>
                                {s.msd_passed ? "PASS" : "FAIL"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              {/* --- DYNAMIC RNAV FIELDS --- */}
              {family === "RNAV" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "14px", borderRadius: theme.radiusSm, display: "flex", flexDirection: "column", gap: "10px", border: `1px solid ${theme.border}`, marginTop: "10px" }}>
                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label style={{...labelStyle, marginTop: 0}}>Mode</label>
                      <select style={inputStyle} value={rnavMode} onChange={e => setRnavMode(e.target.value)}>
                        <option value="RNP APCH">RNP APCH</option>
                        <option value="Advanced RNP">Advanced RNP</option>
                      </select>
                    </div>
                    <div style={{ flex: 0.5 }}>
                      <label style={{...labelStyle, marginTop: 0}}>Alt Unit</label>
                      <select style={inputStyle} value={altUnit} onChange={e => setAltUnit(e.target.value)}>
                        <option value="m">Meters</option>
                        <option value="ft">Feet</option>
                      </select>
                    </div>
                    <div style={{ flex: 0.5 }}>
                      <label style={{...labelStyle, marginTop: 0}}>Acft Cat</label>
                      <select style={inputStyle} value={rnavParams.acft_cat} onChange={e => setRnavParams({ ...rnavParams, acft_cat: e.target.value })}>
                        <option value="A">CAT A</option>
                        <option value="B">CAT B</option>
                        <option value="C">CAT C</option>
                        <option value="D">CAT D</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    <p style={{ fontSize: "11px", color: theme.textMuted, margin: "0", fontStyle: "italic" }}>
                      Tip: Uncheck points to skip drawing dependent segments.
                    </p>

                    {[
                      { key: 'if', title: 'Intermediate Fix (IF)', use: rnavParams.use_if, lat: rnavParams.if_lat, lon: rnavParams.if_lon },
                      { key: 'faf', title: 'Final Approach Fix (FAF)', use: rnavParams.use_faf, lat: rnavParams.faf_lat, lon: rnavParams.faf_lon, alt: rnavParams.faf_alt },
                      { key: 'mapt', title: 'Missed Approach Point (MAPt)', use: rnavParams.use_mapt, lat: rnavParams.mapt_lat, lon: rnavParams.mapt_lon, alt: rnavParams.mapt_alt },
                      { key: 'ma_end', title: 'Missed Approach End Point', use: rnavParams.use_ma_end, lat: rnavParams.ma_end_lat, lon: rnavParams.ma_end_lon }
                    ].map((pt) => {
                      const isActive = pt.use;
                      const isTargeting = selectingRnavPoint === pt.key.toUpperCase();
                      return (
                        <div key={pt.key} style={{ padding: "10px", backgroundColor: isActive ? theme.bg : theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${isActive ? theme.border : 'transparent'}`, transition: "all 0.2s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input type="checkbox" checked={isActive} onChange={e => setRnavParams({ ...rnavParams, [`use_${pt.key}`]: e.target.checked })} style={{ cursor: "pointer" }} />
                            <strong style={{ fontSize: "11px", color: isActive ? theme.navy : theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{pt.title}</strong>
                          </div>
                          {isActive && (
                            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                              <input type="number" placeholder="Lat" style={{ ...inputStyle, padding: "8px" }} value={pt.lat || ""} onChange={e => setRnavParams({ ...rnavParams, [`${pt.key}_lat`]: +e.target.value })} />
                              <input type="number" placeholder="Lon" style={{ ...inputStyle, padding: "8px" }} value={pt.lon || ""} onChange={e => setRnavParams({ ...rnavParams, [`${pt.key}_lon`]: +e.target.value })} />
                              {pt.alt !== undefined && (
                                <input type="number" placeholder="Alt" style={{ ...inputStyle, padding: "8px" }} value={pt.alt || ""} onChange={e => setRnavParams({ ...rnavParams, [`${pt.key}_alt`]: +e.target.value })} title={`Altitude in ${altUnit}`} />
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectingRnavPoint(isTargeting ? null : pt.key.toUpperCase() as any); }} 
                                style={{ padding: "0 10px", backgroundColor: isTargeting ? "#dc3545" : theme.navy, color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", transition: "background 0.2s" }} 
                                title="Pick from 3D Map">
                                {isTargeting ? "Cancel" : "📍"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", cursor: "pointer", color: theme.navy, fontWeight: "bold" }}>
                    <input type="checkbox" checked={useCustomRnav} onChange={e => setUseCustomRnav(e.target.checked)} style={{ cursor: "pointer" }} />
                    Manual Override (XTT / ATT / SW)
                  </label>

                  {useCustomRnav && (
                    <div style={{ border: `1px solid ${theme.border}`, padding: "12px", borderRadius: theme.radiusSm, backgroundColor: theme.bg }}>
                      <div style={{ display: "flex", gap: "5px", fontSize: "10px", fontWeight: "bold", marginBottom: "8px", color: theme.textMuted, textTransform: "uppercase" }}>
                        <span style={{ flex: 1 }}>Fix</span><span style={{ flex: 1 }}>XTT (NM)</span><span style={{ flex: 1 }}>ATT (NM)</span><span style={{ flex: 1 }}>SW (NM)</span>
                      </div>
                      {[
                        { key: "if", lbl: "IF" }, { key: "faf", lbl: "FAF" }, { key: "mapt", lbl: "MAPt" }
                      ].map(row => (
                        <div key={row.key} style={{ display: "flex", gap: "5px", marginBottom: "6px" }}>
                          <span style={{ flex: 1, fontSize: "11px", fontWeight: 600, color: theme.navy, alignSelf: "center" }}>{row.lbl}</span>
                          <input style={{ ...numInputStyle, padding: "6px" }} type="number" value={(rnavOverrides as any)[`${row.key}_xtt`]} onChange={e => setRnavOverrides({ ...rnavOverrides, [`${row.key}_xtt`]: +e.target.value })} />
                          <input style={{ ...numInputStyle, padding: "6px" }} type="number" value={(rnavOverrides as any)[`${row.key}_att`]} onChange={e => setRnavOverrides({ ...rnavOverrides, [`${row.key}_att`]: +e.target.value })} />
                          <input style={{ ...numInputStyle, padding: "6px" }} type="number" value={(rnavOverrides as any)[`${row.key}_sw`]} onChange={e => setRnavOverrides({ ...rnavOverrides, [`${row.key}_sw`]: +e.target.value })} />
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: "8px", marginTop: "10px", borderTop: `1px solid ${theme.border}`, paddingTop: "10px", alignItems: "center" }}>
                        <span style={{ flex: 1, fontSize: "11px", fontWeight: 600, color: theme.navy }}>MAPt to SOC (NM)</span>
                        <input style={{ ...numInputStyle, padding: "8px", flex: 2 }} type="number" placeholder="Auto-calc via VTAS" value={rnavOverrides.mapt_soc} onChange={e => setRnavOverrides({ ...rnavOverrides, mapt_soc: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- VSS / OCS CONFIGURATOR --- */}
              {family === "VSS" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px", padding: "14px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  
                  <div style={{ display: "flex", gap: "8px", backgroundColor: "#fff8eb", padding: "12px", borderRadius: theme.radiusSm, border: "1px solid #f5d6b0" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "10px", fontWeight: "bold", color: "#c05621", textTransform: "uppercase" }}>VPA (°)</label>
                      <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={vssParams.vpa} onChange={e => handleVpaOrTypeChange(+e.target.value, vssParams.appType)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "10px", fontWeight: "bold", color: "#c05621", textTransform: "uppercase" }}>RDH (m)</label>
                      <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={vssParams.rdh} onChange={e => setVssParams({ ...vssParams, rdh: +e.target.value })} />
                    </div>
                    <div style={{ flex: 1.5 }}>
                      <label style={{ fontSize: "10px", fontWeight: "bold", color: "#c05621", textTransform: "uppercase" }}>Approach Type</label>
                      <select style={{ ...inputStyle, padding: "8px" }} value={vssParams.appType} onChange={e => handleVpaOrTypeChange(vssParams.vpa, e.target.value)}>
                        <option value="NPA">NPA (VPA - 1°)</option>
                        <option value="APV_BARO">APV Baro (VPA - 0.5°)</option>
                        <option value="APV_GEO">APV Geo (VPA - 0.5°)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>VSS Half-W (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={vssParams.stripWidth} onChange={e => setVssParams({ ...vssParams, stripWidth: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>OCS Start HW (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={vssParams.ocsStartWidth} onChange={e => setVssParams({ ...vssParams, ocsStartWidth: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>OCS End Base (m)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={vssParams.ocsEndWidthBase} onChange={e => setVssParams({ ...vssParams, ocsEndWidthBase: +e.target.value })} title="120m standard" />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>VSS Angle (°)</label>
                        <input type="number" step="0.01" style={{ ...inputStyle, padding: "8px", backgroundColor: theme.lightBlue }} value={vssParams.vssAngle} onChange={e => setVssParams({ ...vssParams, vssAngle: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>OCS Angle (°)</label>
                        <input type="number" step="0.01" style={{ ...inputStyle, padding: "8px", backgroundColor: theme.lightBlue }} value={vssParams.ocsAngle} onChange={e => setVssParams({ ...vssParams, ocsAngle: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Offset Angle (°)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={vssParams.offsetAngle} onChange={e => setVssParams({ ...vssParams, offsetAngle: +e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "15px", backgroundColor: theme.bg, padding: "12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", color: theme.navy, fontWeight: "bold", cursor: "pointer" }}>
                      <input type="checkbox" checked={vssParams.drawVSS} onChange={e => setVssParams({ ...vssParams, drawVSS: e.target.checked })} style={{ cursor: "pointer" }} /> Draw VSS
                    </label>
                    <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", color: theme.navy, fontWeight: "bold", cursor: "pointer" }}>
                      <input type="checkbox" checked={vssParams.drawOCS} onChange={e => setVssParams({ ...vssParams, drawOCS: e.target.checked })} style={{ cursor: "pointer" }} /> Draw OCS
                    </label>
                  </div>
                </div>
              )}

              {/* DYNAMIC NAVAID FIELDS */}
              {family === "NAVAID" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "16px", borderRadius: theme.radiusSm, display: "flex", flexDirection: "column", gap: "12px", border: `1px solid ${theme.border}`, marginTop: "10px" }}>
                  <div>
                    <label style={{...labelStyle, marginTop: 0}}>Facility Type (EUR Doc 015)</label>
                    <select style={inputStyle} value={navType} onChange={e => setNavType(e.target.value)}>
                      <optgroup label="Omni-directional">
                        <option value="CVOR">CVOR (Conventional VOR)</option>
                        <option value="DVOR">DVOR (Doppler VOR)</option>
                        <option value="DF">DF (Direction Finder)</option>
                        <option value="DME">DME</option>
                        <option value="NDB">NDB</option>
                        <option value="GBAS_GRR">GBAS GRR</option>
                        <option value="GBAS_VDB">GBAS VDB</option>
                        <option value="VDB_MS">VDB MS</option>
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
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{ ...labelStyle, marginTop: 0 }}>Antenna Coordinates (Lat/Lon/Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setNavCoord, navCoord)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={navCoord.lat} onChange={e => setNavCoord({ ...navCoord, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={navCoord.lon} onChange={e => setNavCoord({ ...navCoord, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={navCoord.alt} onChange={e => setNavCoord({ ...navCoord, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>
                  </div>

                  {isDirectional && (
                    <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                      <label style={{...labelStyle, marginTop: 0}}>Operational Bearing (°)</label>
                      <input style={{...inputStyle, marginBottom: "10px"}} type="number" value={navBearing} onChange={e => setNavBearing(+e.target.value)} />
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <label style={{ ...labelStyle, marginTop: 0 }}>Reference Threshold (Lat/Lon/Alt)</label>
                        <button 
                          style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                          onClick={() => getCenterFromMap(setNavThr, navThr)}>
                          📍 Map
                        </button>
                      </div>
                      <div style={rowStyle}>
                        <input style={numInputStyle} type="number" value={navThr.lat} onChange={e => setNavThr({ ...navThr, lat: +e.target.value })} placeholder="Lat" />
                        <input style={numInputStyle} type="number" value={navThr.lon} onChange={e => setNavThr({ ...navThr, lon: +e.target.value })} placeholder="Lon" />
                        <input style={numInputStyle} type="number" value={navThr.alt} onChange={e => setNavThr({ ...navThr, alt: +e.target.value })} placeholder="Alt" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- HOLDING & REVERSAL CONFIGURATOR --- */}
              {family === "HOLDING" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px", padding: "14px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  
                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Procedure Definition</strong>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{...labelStyle, marginTop: 0}}>Fix / Station (Lat / Lon / Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setT1, t1)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={t1.lat} onChange={e => setT1({ ...t1, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={t1.lon} onChange={e => setT1({ ...t1, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={t1.alt} onChange={e => setT1({ ...t1, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <div style={{ flex: 1.5 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Procedure Type</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={holdingParams.type} onChange={e => setHoldingParams({ ...holdingParams, type: e.target.value })}>
                          <option value="HOLDING">Holding Pattern</option>
                          <option value="RACETRACK">Racetrack</option>
                          <option value="BASE_TURN">Base Turn</option>
                          <option value="PROC_TURN_45">45°/180° Proc Turn</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Inbound Brg (°)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.inbound_brg} onChange={e => setHoldingParams({ ...holdingParams, inbound_brg: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Turn Dir</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={holdingParams.turn_dir} onChange={e => setHoldingParams({ ...holdingParams, turn_dir: e.target.value })}>
                          <option value="R">Right</option>
                          <option value="L">Left</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Flight Parameters</strong>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>IAS (kt)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.ias} onChange={e => setHoldingParams({ ...holdingParams, ias: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Altitude (ft)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.alt_ft} onChange={e => setHoldingParams({ ...holdingParams, alt_ft: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Time (min)</label>
                        <input type="number" step="0.5" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.time_min} onChange={e => setHoldingParams({ ...holdingParams, time_min: +e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>AD Elev (ft)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.ad_elev_ft} onChange={e => setHoldingParams({ ...holdingParams, ad_elev_ft: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Temp Ref (°C)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={holdingParams.temp_ref_c} onChange={e => setHoldingParams({ ...holdingParams, temp_ref_c: +e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- PANS-OPS WIND SPIRAL CONFIGURATOR --- */}
              {family === "WIND_SPIRAL" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px", padding: "14px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  
                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Turn Origin (Start)</strong>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{...labelStyle, marginTop: 0}}>Start Point (Lat / Lon / Alt)</label>
                      <button 
                        style={{ backgroundColor: theme.navy, color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                        onClick={() => getCenterFromMap(setT1, t1)}>
                        📍 Map
                      </button>
                    </div>
                    <div style={rowStyle}>
                      <input style={numInputStyle} type="number" value={t1.lat} onChange={e => setT1({ ...t1, lat: +e.target.value })} placeholder="Lat" />
                      <input style={numInputStyle} type="number" value={t1.lon} onChange={e => setT1({ ...t1, lon: +e.target.value })} placeholder="Lon" />
                      <input style={numInputStyle} type="number" value={t1.alt} onChange={e => setT1({ ...t1, alt: +e.target.value })} placeholder="Alt (m)" />
                    </div>
                    
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <div style={{ flex: 1.5 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Inbound Bearing (°)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.inbound_bearing} onChange={e => setWsParams({ ...wsParams, inbound_bearing: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Turn Direction</label>
                        <select style={{ ...inputStyle, padding: "8px" }} value={wsParams.turn_direction} onChange={e => setWsParams({ ...wsParams, turn_direction: e.target.value })}>
                          <option value="R">Right (R)</option>
                          <option value="L">Left (L)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "12px", backgroundColor: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <strong style={{ fontSize: "11px", color: theme.navy, display: "block", marginBottom: "10px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Aircraft & Flight Dynamics</strong>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>IAS (kt)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.ias} onChange={e => setWsParams({ ...wsParams, ias: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Altitude (ft)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.altitude_ft} onChange={e => setWsParams({ ...wsParams, altitude_ft: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Bank Angle (°)</label>
                        <input type="number" step="0.1" style={{ ...inputStyle, padding: "8px" }} value={wsParams.bank_angle} onChange={e => setWsParams({ ...wsParams, bank_angle: +e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Wind Speed (kt)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.wind_speed} onChange={e => setWsParams({ ...wsParams, wind_speed: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>AD Elev (ft)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.ad_elev_ft} onChange={e => setWsParams({ ...wsParams, ad_elev_ft: +e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "10px", fontWeight: "bold", color: theme.textMuted }}>Temp Ref (°C)</label>
                        <input type="number" style={{ ...inputStyle, padding: "8px" }} value={wsParams.temp_ref_c} onChange={e => setWsParams({ ...wsParams, temp_ref_c: +e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC OFZ FIELDS */}
              {family === "OFZ" && (
                <div style={{ backgroundColor: theme.bgOff, padding: "16px", borderRadius: theme.radiusSm, display: "flex", flexDirection: "column", gap: "8px", border: `1px solid ${theme.border}`, marginTop: "10px" }}>
                  <label style={{...labelStyle, marginTop: 0}}>Aeroplane Design Group (ADG)</label>
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
                <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px", opacity: user?.is_premium ? 1 : 0.6, padding: "16px", backgroundColor: theme.bgOff, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                  <label style={{ ...labelStyle, color: "#d4af37", marginTop: 0 }}>★ Premium Feature: Geometry Import</label>
                  <p style={{ fontSize: "12px", color: theme.textMuted, margin: "0 0 8px 0", lineHeight: 1.4 }}>Upload KML, DXF, GeoJSON, or AIXM files.</p>
                  <input
                    type="file"
                    accept=".csv,.txt,.kml,.dxf,.geojson,.json,.aixm,.xml"
                    onChange={handleFileUpload}
                    style={{ ...inputStyle, padding: "8px", fontSize: "13px" }}
                    disabled={!user?.is_premium}
                  />
                  <label style={{ ...labelStyle, marginTop: "10px" }}>Coordinates Data</label>
                  <textarea
                    style={{ ...inputStyle, height: "120px", fontFamily: "monospace", fontSize: "12px", lineHeight: "1.4", resize: "vertical" }}
                    placeholder={`Format: Name, Lat1, Lon1, Alt1, Lat2, Lon2, Alt2...\nExample:\nBuilding_A, 51.47, -0.45, 100, 51.48, -0.44, 105, 51.46, -0.44, 100`}
                    value={customPoints}
                    onChange={e => setCustomPoints(e.target.value)}
                    disabled={!user?.is_premium}
                  />
                  {!user?.is_premium && <p style={{ color: "#e74c3c", fontSize: "12px", margin: 0, fontWeight: "bold" }}>Upgrade to Premium to define Custom Surfaces.</p>}
                </div>
              )}

              <button
                onClick={handleDefine}
                style={{ ...createBtnStyle, opacity: isCreating ? 0.7 : 1, cursor: isCreating ? "wait" : "pointer" }}
                disabled={isCreating}
              >
                {isCreating ? "⏳ Processing..." : `Create ${family} Surface`}
              </button>
            </div>
          )}

          {/* --- ANALYZE TAB --- */}
          {activeTab === "analyze" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* --- GOOGLE 3D TILES TOGGLE --- */}
                {(currentOwnerToken || (user?.is_premium && user?.ion_token)) && (
                  <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", color: theme.text, cursor: "pointer", padding: "0 4px", fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={showGoogleTiles} 
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setShowGoogleTiles(isChecked);
                        if (isChecked) {
                            const tokenToUse = currentOwnerToken || user?.ion_token || DEFAULT_ION_TOKEN;
                            Cesium.Ion.defaultAccessToken = tokenToUse;
                        }
                      }} 
                      style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: theme.navy }}
                    />
                    Enable Google Photorealistic 3D Tiles
                  </label>
                )}

                {/* 1. PUBLIC PREMIUM SURFACES SEARCH */}
                <div style={{ backgroundColor: theme.bgOff, padding: "10px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                  <label style={{...labelStyle, marginTop: 0, color: theme.navy, display: "flex", alignItems: "center", gap: "6px"}}>
                    <span style={{ fontSize: "14px" }}>🔍</span> Search Public Surfaces
                  </label>
                  <input 
                    style={{...inputStyle, padding: "5px 12px", fontSize: "14px"}} 
                    value={pubSurfQuery}
                    onChange={e => handleSearchPublicSurfaces(e.target.value)}
                    onFocus={e => { if (pubSurfResults.length === 0) handleSearchPublicSurfaces(e.target.value); }}
                    onBlur={() => { setTimeout(() => setPubSurfResults([]), 200); }}
                    placeholder="Type airport name or ICAO..."
                  />
                  {/* SEARCH RESULTS AUTOCOMPLETE */}
                  {pubSurfResults.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: theme.bg, border: `1px solid ${theme.border}`, zIndex: 100, maxHeight: "220px", overflowY: "auto", boxShadow: theme.shadowHover, borderRadius: theme.radiusSm, marginTop: "4px" }}>
                      {pubSurfResults.map((s: any, idx) => (
                        <div key={idx} onClick={async () => {
                            setSelectedAnalysisAirport(s.airport_name); setSelectedAnalysisOwner(s.owner_id); setPubSurfQuery(s.airport_name); setPubSurfResults([]); 
                            try {
                              const res = await fetch(`${API_BASE}/airports/${s.owner_id}/${encodeURIComponent(s.airport_name)}`);
                              if (res.ok) {
                                const data = await res.json();
                                if (data.ion_token) { Cesium.Ion.defaultAccessToken = data.ion_token; setCurrentOwnerToken(data.ion_token); } 
                                else { Cesium.Ion.defaultAccessToken = DEFAULT_ION_TOKEN; setCurrentOwnerToken(null); }
                                if (showBuildings && viewerRef.current) {
                                  if (buildingsRef.current) { viewerRef.current.scene.primitives.remove(buildingsRef.current); buildingsRef.current = null; }
                                  try { const buildings = await Cesium.createOsmBuildingsAsync(); viewerRef.current.scene.primitives.add(buildings); buildingsRef.current = buildings; } catch (err) {}
                                }
                                let newOffset = geoidOffset;
                                if (data.surfaces.length > 0 && data.surfaces[0].geometry.length > 0) {
                                  const firstCoord = getFirstCoord(data.surfaces[0].geometry);
                                  if (firstCoord) newOffset = await autoFetchGeoidOffset(firstCoord[1], firstCoord[0]);
                                }
                                handleDrawSurface(data.surfaces, newOffset);
                              }
                            } catch (err) {}
                          }}
                          style={{ padding: "12px", borderBottom: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "13px", color: theme.text, transition: "background 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.lightBlue}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <strong>{s.airport_name}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. MY SURFACES DROPDOWN */}
                <div style={{ padding: "0 4px" }}>
                  <label style={labelStyle}>Or Select Personal Workspace</label>
                  <select 
                    style={{...inputStyle, cursor: "pointer"}} 
                    value={savedSurfaces.some(s => s.airport_name === selectedAnalysisAirport) ? selectedAnalysisAirport : ""} 
                    onChange={async e => {
                      const chosenAirport = e.target.value; setSelectedAnalysisAirport(chosenAirport); setSelectedAnalysisOwner(user?.id || 0); setPubSurfQuery(""); 
                      if (chosenAirport) {
                        const airportSurfaces = savedSurfaces.filter(s => s.airport_name === chosenAirport);
                        let newOffset = geoidOffset;
                        if (airportSurfaces.length > 0 && airportSurfaces[0].geometry.length > 0) {
                          const firstCoord = getFirstCoord(airportSurfaces[0].geometry);
                          if (firstCoord) newOffset = await autoFetchGeoidOffset(firstCoord[1], firstCoord[0]);
                        }
                        handleDrawSurface(airportSurfaces, newOffset);
                      } else { if (viewerRef.current) viewerRef.current.entities.removeAll(); }
                    }}
                  >
                    <option value="">Select your airport...</option>
                    {Array.from(new Set(savedSurfaces.map(s => s.airport_name))).map(airport => (
                      <option key={airport} value={airport}>{airport}</option>
                    ))}
                  </select>
                </div>
                
                {/* 3. SINGLE OBSTACLE ANALYSIS */}
                <div style={{ padding: "0 4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={labelStyle}>Target Obstacle (Lat/Lon/Alt)</label>
                    <span style={{ fontSize: "10px", color: theme.textMuted, fontStyle: "italic", fontWeight: 600 }}>🖱️ Click map to pick</span>
                  </div>
                  <div style={rowStyle}>
                    <input style={numInputStyle} type="number" value={obsPos.lat} onChange={e => setObsPos({...obsPos, lat: +e.target.value})} placeholder="Lat" />
                    <input style={numInputStyle} type="number" value={obsPos.lon} onChange={e => setObsPos({...obsPos, lon: +e.target.value})} placeholder="Lon" />
                    <input style={numInputStyle} type="number" value={obsPos.alt} onChange={e => setObsPos({...obsPos, alt: +e.target.value})} placeholder="Alt (m)" />
                  </div>
                </div>

                <button 
                  style={{ ...createBtnStyle, marginTop: "0px", opacity: isAnalyzing ? 0.7 : 1, cursor: isAnalyzing ? "wait" : "pointer" }}
                  disabled={isAnalyzing}
                  onClick={async () => {
                    if (!selectedAnalysisAirport) return showToast("Please select an airport first!", "error");
                    setIsAnalyzing(true); setAnalysisResult(null);
                    try {
                      const isGuestAirport = selectedAnalysisOwner === 0;
                      const guestPayload = isGuestAirport ? savedSurfaces.filter(s => s.airport_name === selectedAnalysisAirport).map(s => ({name: s.name, geometry: s.geometry})) : null;
                      const res = await fetch(`${API_BASE}/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lat: obsPos.lat, lon: obsPos.lon, alt: obsPos.alt, airport_name: selectedAnalysisAirport, owner_id: selectedAnalysisOwner, guest_surfaces: guestPayload }) });
                      const result = await res.json();
                      if (result.error) return showToast(result.error, "error");
                      setAnalysisResult(result);
                    } catch (err) { showToast("Analysis failed.", "error"); } 
                    finally { setIsAnalyzing(false); }
                  }}
                >
                  {isAnalyzing ? "⚙️ Processing..." : "Run Analysis"}
                </button>

                {/* --- ANALYSIS RESULTS UI & PDF EXPORT --- */}
                {analysisResult && (
                  <div style={{ backgroundColor: analysisResult.penetration ? "#fff5f5" : "#f0fdf4", padding: "16px", borderRadius: theme.radiusSm, border: `1px solid ${analysisResult.penetration ? "#fed7d7" : "#bbf7d0"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <h4 style={{ margin: "0 0 12px 0", color: analysisResult.penetration ? "#c53030" : "#15803d", fontSize: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
                      {analysisResult.penetration ? "❌ VIOLATION DETECTED" : "✅ OBSTACLE CLEAR"}
                    </h4>
                    <div style={{ fontSize: "12px", color: theme.text, lineHeight: 1.6, marginBottom: "16px" }}>
                      <p style={{ margin: 0 }}><strong>Limiting Surface:</strong> {analysisResult.limiting_surface}</p>
                      <p style={{ margin: 0 }}><strong>Margin:</strong> {analysisResult.margin} m</p>
                    </div>
                    <button 
                      style={{ width: "100%", padding: "12px", backgroundColor: theme.navy, color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", transition: "background 0.2s", fontSize: "13px" }} 
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.navyHover}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                      onClick={generatePDF}
                    >
                      ⤓ Download Official Report (PDF)
                    </button>
                  </div>
                )}

                {/* --- PREMIUM: BATCH UPLOAD --- */}
                <div style={{ backgroundColor: theme.bgOff, padding: "16px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, opacity: user?.is_premium ? 1 : 0.6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{...labelStyle, color: "#d4af37", margin: 0}}>★ Batch Obstacle Upload</label>
                      <input type="file" accept=".csv,.txt,.geojson,.json,.aixm,.xml,.kml" onChange={handleBatchFileUpload} disabled={!user?.is_premium} style={{ fontSize: "11px", maxWidth: "120px" }} />
                  </div>
                  <p style={{fontSize: "11px", color: theme.textMuted, margin: "0 0 10px 0", lineHeight: 1.4}}>Upload GeoJSON, AIXM, KML or CSV to analyse multiple targets instantly.</p>
                  
                  <textarea 
                    style={{ ...inputStyle, height: "100px", fontFamily: "monospace", fontSize: "12px", lineHeight: "1.4", resize: "vertical" }} 
                    placeholder={`Crane_1, 51.47, -0.45, 120\nBuilding_A, 51.472, -0.44, 95\n...`}
                    value={batchInput} onChange={e => setBatchInput(e.target.value)} disabled={!user?.is_premium}
                  />
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                    <button 
                      style={{ width: "100%", padding: "12px", backgroundColor: user?.is_premium ? theme.blue : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: user?.is_premium ? "pointer" : "not-allowed", transition: "background 0.2s" }} 
                      disabled={!user?.is_premium || isAnalyzingBatch} 
                      onClick={handleBatchAnalyze}
                    >
                      {isAnalyzingBatch ? "⏳ Processing Batch..." : "Run Batch Analysis"}
                    </button>
                    
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        style={{ flex: 1, padding: "10px", backgroundColor: user?.is_premium && batchResults.length > 0 ? theme.navy : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium && batchResults.length > 0 ? "pointer" : "not-allowed", transition: "background 0.2s" }} 
                        disabled={!user?.is_premium || batchResults.length === 0} 
                        onClick={downloadBatchCSV}
                      >
                        ⤓ .CSV Results
                      </button>
                      <button 
                        style={{ flex: 1, padding: "10px", backgroundColor: user?.is_premium && batchResults.length > 0 ? "#b91c1c" : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium && batchResults.length > 0 ? "pointer" : "not-allowed", transition: "background 0.2s" }} 
                        disabled={!user?.is_premium || batchResults.length === 0} 
                        onClick={generateBatchPDF}
                      >
                        ⤓ PDF Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* --- PREMIUM EXPORT PANEL --- */}
                {selectedAnalysisAirport && (
                  <div style={{ backgroundColor: "#fefcbf", padding: "16px", borderRadius: theme.radiusSm, border: "1px solid #fbd38d" }}>
                    <label style={{...labelStyle, color: "#975a16", margin: "0 0 10px 0"}}>★ Premium Export Tools</label>
                    <p style={{fontSize: "11px", color: "#975a16", margin: "0 0 12px 0", lineHeight: 1.4}}>Download this generated airspace into your native GIS tools.</p>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      <button style={{ flex: "1 1 45%", padding: "10px", backgroundColor: user?.is_premium ? theme.navy : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium ? "pointer" : "not-allowed", transition: "background 0.2s" }} disabled={!user?.is_premium} onClick={() => handleExport('kml')}>⭳ .KML</button>
                      <button style={{ flex: "1 1 45%", padding: "10px", backgroundColor: user?.is_premium ? theme.navy : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium ? "pointer" : "not-allowed", transition: "background 0.2s" }} disabled={!user?.is_premium} onClick={() => handleExport('dxf')}>⭳ .DXF</button>
                      <button style={{ flex: "1 1 45%", padding: "10px", backgroundColor: user?.is_premium ? "#15803d" : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium ? "pointer" : "not-allowed", transition: "background 0.2s" }} disabled={!user?.is_premium} onClick={() => handleExport('geojson')}>⭳ GeoJSON</button>
                      <button style={{ flex: "1 1 45%", padding: "10px", backgroundColor: user?.is_premium ? "#b91c1c" : "#cbd5e1", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: 600, fontSize: "12px", cursor: user?.is_premium ? "pointer" : "not-allowed", transition: "background 0.2s" }} disabled={!user?.is_premium} onClick={() => handleExport('aixm')}>⭳ AIXM 5.1</button>
                    </div>
                    
                    {!user?.is_premium && (
                      <p style={{ color: "#c53030", fontSize: "11px", marginTop: "10px", textAlign: "center", fontWeight: "bold" }}>
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
              const maxAirports = user ? user.max_airports : 0; 
              
              return (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "10px" }}>
                  <label style={{...labelStyle, margin: 0, fontSize: "14px", color: theme.navy}}>Saved Airspaces</label>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: user?.is_premium ? theme.navy : theme.textMuted, backgroundColor: theme.bgOff, padding: "4px 8px", borderRadius: "12px", border: `1px solid ${theme.border}` }}>
                    Storage: {uniqueAirportsCount} / {maxAirports}
                  </span>
                </div>

                {user?.is_premium && uniqueAirportsCount > 0 && (
                  <div style={{ backgroundColor: theme.lightBlue, padding: "16px", borderRadius: theme.radiusSm, border: "1px solid #cce5ff", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                    <label style={{...labelStyle, margin: 0, color: theme.navy, marginBottom: "12px"}}>⚙️ Manage Visibility</label>
                    <select style={{...inputStyle, cursor: "pointer"}} value={manageAptSelect} onChange={e => {
                        const apt = e.target.value; setManageAptSelect(apt); setManageAptName(apt);
                        const surf = savedSurfaces.find(s => s.airport_name === apt); setManageAptPublic(surf?.is_public ?? true);
                      }}>
                      <option value="">Select an airport to edit...</option>
                      {Array.from(new Set(savedSurfaces.map(s => s.airport_name))).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    {manageAptSelect && (
                      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px dashed #b3d9f7", paddingTop: "12px" }}>
                        <input style={inputStyle} value={manageAptName} onChange={e => setManageAptName(e.target.value)} placeholder="Rename Airport" />
                        <label style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", color: theme.text, cursor: "pointer", fontWeight: 600 }}>
                          <input type="checkbox" checked={manageAptPublic} onChange={e => setManageAptPublic(e.target.checked)} style={{cursor:"pointer", width: "16px", height: "16px", accentColor: theme.navy}}/>
                          Public (Visible in CAA Verified Search)
                        </label>
                        <button 
                          style={{ padding: "12px", backgroundColor: theme.navy, color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.navyHover}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}
                          onClick={async () => {
                            if (!manageAptName) return showToast("Name cannot be empty.", "error");
                            const res = await fetch(`${API_BASE}/airports/${encodeURIComponent(manageAptSelect)}`, { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify({ new_name: manageAptName, is_public: manageAptPublic }) });
                            if (res.ok) {
                              showToast("Airport updated successfully!", "success");
                              setSavedSurfaces(prev => prev.map(s => s.airport_name === manageAptSelect ? { ...s, airport_name: manageAptName, is_public: manageAptPublic } : s ));
                              setManageAptSelect(manageAptName); 
                            } else { const err = await res.json(); showToast(`Error: ${err.detail || "Failed to update"}`, "error"); }
                          }}> Save Changes </button>
                      </div>
                    )}
                  </div>
                )}

                {!user ? (
                  <div style={{ backgroundColor: "#fff5f5", border: "1px solid #fed7d7", padding: "20px", borderRadius: theme.radiusSm, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <p style={{ fontSize: "13px", color: "#c53030", margin: 0, fontWeight: 600 }}>Please log in to manage your saved surfaces.</p>
                  </div>
                ) : savedSurfaces.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", border: `2px dashed ${theme.border}`, borderRadius: theme.radiusSm, backgroundColor: theme.bgOff }}>
                    <span style={{fontSize: "24px", display: "block", marginBottom: "10px", color: "#cbd5e1"}}>📂</span>
                    <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0, fontWeight: 500 }}>You haven't saved any surfaces yet. Go to the Define tab to create one!</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "55vh", overflowY: "auto", paddingRight: "4px" }}>
                    {savedSurfaces.map(s => (
                      <div key={s.id} style={{ padding: "16px", backgroundColor: theme.bgOff, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <strong style={{ fontSize: "14px", color: theme.navy, lineHeight: 1.3 }}>
                            {s.airport_name ? `${s.airport_name} - ` : ""}{s.name}
                          </strong>
                          <span style={{ fontSize: "10px", backgroundColor: theme.bg, border: `1px solid ${theme.border}`, padding: "4px 8px", borderRadius: "12px", color: theme.textMuted, fontWeight: 700, letterSpacing: "0.5px" }}>
                            {s.family}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: theme.textMuted, margin: "0 0 12px 0", fontStyle: "italic" }}>
                          Contains {s.geometry.length} 3D geometric meshes.
                        </div>
                        <div style={{...rowStyle, borderTop: `1px solid ${theme.border}`, paddingTop: "12px"}}>
                          <button style={{ flex: 1, padding: "10px", backgroundColor: theme.blue, color: "white", border: "none", borderRadius: theme.radiusSm, fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blueHover}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.blue}
                            onClick={async () => {
                              let newOffset = geoidOffset; if (s.geometry && s.geometry.length > 0) { const firstCoord = getFirstCoord(s.geometry); if (firstCoord) newOffset = await autoFetchGeoidOffset(firstCoord[1], firstCoord[0]); } handleDrawSurface([s], newOffset);
                            }}> 🗺️ Draw </button>
                          <button style={{ flex: 1, padding: "10px", backgroundColor: "#64748b", color: "white", border: "none", borderRadius: theme.radiusSm, fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#475569"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#64748b"}
                            onClick={() => setExpandedSurfaceId(expandedSurfaceId === s.id ? null : s.id)}>
                            {expandedSurfaceId === s.id ? "▲ Close" : "▼ Layers"}
                          </button>
                          <button style={{ flex: 0.4, padding: "10px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: theme.radiusSm, fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} 
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#dc2626"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#ef4444"}
                            onClick={() => handleDeleteSurface(s.id)}> 🗑️ </button>
                        </div>
                        {expandedSurfaceId === s.id && (
                            <div style={{ marginTop: "12px", padding: "12px", backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm }}>
                                <small style={{ fontWeight: "bold", color: theme.textMuted, textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.5px" }}>Individual Layers:</small>
                                <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0 0" }}>
                                    {s.geometry.map((geo: any, idx: number) => (
                                        <li key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: idx === s.geometry.length - 1 ? "none" : `1px solid ${theme.border}`, padding: "8px 0", fontSize: "12px" }}>
                                            <span style={{ color: theme.text, fontWeight: 500 }}>{geo.name}</span>
                                            <button onClick={() => handleDeleteComponent(s.id, geo.name)} style={{ border: "none", background: "none", color: "#dc3545", cursor: "pointer", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fee2e2"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"} title="Delete layer"> ✖ </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {!user?.is_premium && uniqueAirportsCount >= 1 && (
                  <div style={{ backgroundColor: "#fefcbf", padding: "12px", borderRadius: theme.radiusSm, border: "1px solid #fbd38d", marginTop: "10px" }}>
                    <p style={{ color: "#975a16", fontSize: "12px", margin: 0, textAlign: "center", lineHeight: 1.5 }}>
                      <strong>Free Tier Limit Reached.</strong><br/>
                      Upgrade to Premium to save up to 10 distinct airport configurations.
                    </p>
                  </div>
                )}
                
                {user?.is_premium && (
                  <div style={{ backgroundColor: theme.lightBlue, padding: "16px", borderRadius: theme.radiusSm, border: "1px solid #cce5ff", marginTop: "16px" }}>
                    <label style={{...labelStyle, margin: 0, color: theme.navy, marginBottom: "6px"}}>🗄️ Official Authorization Logs</label>
                    <p style={{ fontSize: "12px", color: theme.textMuted, margin: "0 0 16px 0", lineHeight: 1.4 }}>
                      Download a complete CSV record of all official evaluation PDFs generated for your airspaces.
                    </p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "11px", fontWeight: 600, color: theme.navy, display: "block", marginBottom: "6px" }}>Start Date</label>
                        <input type="date" style={{ ...inputStyle, padding: "10px", fontSize: "13px" }} value={logStartDate} onChange={e => setLogStartDate(e.target.value)} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "11px", fontWeight: 600, color: theme.navy, display: "block", marginBottom: "6px" }}>End Date</label>
                        <input type="date" style={{ ...inputStyle, padding: "10px", fontSize: "13px" }} value={logEndDate} onChange={e => setLogEndDate(e.target.value)} />
                      </div>
                    </div>
                    <button onClick={handleDownloadLogs} style={{ width: "100%", padding: "12px", backgroundColor: "#15803d", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", fontSize: "13px", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#166534"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#15803d"}>
                      ⤓ Download CSV History
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
  );
}
