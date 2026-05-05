// @ts-nocheck
"use client";

export default function AccountPanel(props: any) {
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
          // THE FIX: Increased zIndex to 99 so it floats above Quick Tools, 
          // and positioned it relative to the bottom right corner
          position: "absolute", bottom: "100px", right: "20px", zIndex: 99, 
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px"
        }}>
          {/* TOGGLE BUTTON */}
          <button
            onClick={() => setShowAccountPanel(!showAccountPanel)}
            style={{
              width: "50px", height: "50px", borderRadius: "50%", 
              // THE FIX: Pure white background with Navy border/icon so it is highly visible
              backgroundColor: "white", color: theme.navy, 
              border: `2px solid ${theme.navy}`, boxShadow: theme.shadowHover,
              cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", 
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.lightBlue; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}
            title={showAccountPanel ? "Minimize Panel" : "Show Account Panel"}
          >
            {showAccountPanel ? "✕" : (user ? "👤" : "🔑")}
          </button>

          {/* PANEL CONTENT */}
          {showAccountPanel && (
            <div style={{
              width: "340px", backgroundColor: "rgba(255, 255, 255, 0.98)", backdropFilter: "blur(10px)",
              padding: "24px", borderRadius: theme.radius, boxShadow: theme.shadowHover, border: `1px solid ${theme.border}`
            }}>
              {!user ? (
                isResending ? (
                  // RESEND VERIFICATION
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <strong style={{ fontSize: "18px", color: theme.navy, fontWeight: 800 }}>Resend Verification</strong>
                    <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>Enter your email to receive a new activation link.</p>
                    <input style={inputStyle} type="email" value={resendEmailInput} onChange={e => setResendEmailInput(e.target.value)} placeholder="Registered Email Address" />
                    <button style={{ width: "100%", padding: "12px", backgroundColor: "#0891b2", color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0e7490"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#0891b2"}
                      onClick={async () => {
                        if (!resendEmailInput) return showToast("Please enter your email", "error");
                        const res = await fetch(`${API_BASE}/resend-verification`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: resendEmailInput }) });
                        const data = await res.json(); showToast(data.message, "info"); setIsResending(false);
                      }}> Send New Link </button>
                    <button style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "12px", cursor: "pointer", marginTop: "4px", fontWeight: 600, textDecoration: "underline" }} onClick={() => setIsResending(false)}> Back to Login </button>
                  </div>
                ) : isForgotPassword ? (
                  // FORGOT PASSWORD
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <strong style={{ fontSize: "18px", color: theme.navy, fontWeight: 800 }}>Reset Password</strong>
                    <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>Enter your account email to receive a reset link.</p>
                    <input style={inputStyle} type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Registered Email Address" />
                    <button style={{ width: "100%", padding: "12px", backgroundColor: theme.blue, color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blueHover} onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.blue}
                      onClick={async () => {
                        if (!forgotEmail) return showToast("Please enter your email", "error");
                        await fetch(`${API_BASE}/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail }) });
                        showToast("If that email exists in our system, a reset link has been sent.", "info"); setIsForgotPassword(false);
                      }}> Send Reset Link </button>
                    <button style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "12px", cursor: "pointer", marginTop: "4px", fontWeight: 600, textDecoration: "underline" }} onClick={() => setIsForgotPassword(false)}> Back to Login </button>
                  </div>
                ) : (
                  // LOGIN/REGISTER
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "18px", color: theme.navy, fontWeight: 800 }}>{isRegistering ? "Register Account" : "Guest Mode"}</strong>
                      {!isRegistering && <span style={{ fontSize: "11px", backgroundColor: theme.border, padding: "4px 10px", borderRadius: "12px", fontWeight: 700, color: theme.textMuted }}>Free Tier</span>}
                    </div>
                    {!isRegistering && <p style={{ fontSize: "13px", color: theme.textMuted, margin: 0, lineHeight: 1.5 }}>Create 1 surface temporarily as a guest, or log in for premium features.</p>}
                    <hr style={{ margin: "4px 0", borderTop: `1px solid ${theme.border}` }} />
                    {isRegistering && <input style={inputStyle} type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} placeholder="Email Address" />}
                    <input style={inputStyle} value={loginInput} onChange={e => setLoginInput(e.target.value)} placeholder="Username" />
                    <input type="password" style={inputStyle} value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Password" />
                    <button disabled={isLoggingIn}
                      style={{ width: "100%", padding: "14px", backgroundColor: isRegistering ? "#15803d" : theme.blue, color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: isLoggingIn ? "wait" : "pointer", opacity: isLoggingIn ? 0.7 : 1, marginTop: "6px", fontSize: "14px", transition: "background 0.2s" }} 
                      onClick={handleAuth}
                      onMouseEnter={e => {if (!isLoggingIn) e.currentTarget.style.backgroundColor = isRegistering ? "#166534" : theme.blueHover}}
                      onMouseLeave={e => {if (!isLoggingIn) e.currentTarget.style.backgroundColor = isRegistering ? "#15803d" : theme.blue}}
                    > {isLoggingIn ? "⏳ Processing..." : (isRegistering ? "Sign Up" : "Log In")} </button>
                    <button style={{ background: "none", border: "none", color: theme.blue, fontSize: "13px", cursor: "pointer", marginTop: "6px", fontWeight: 600, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = theme.navy} onMouseLeave={e => e.currentTarget.style.color = theme.blue} onClick={() => setIsRegistering(!isRegistering)}>
                      {isRegistering ? "Already have an account? Log in." : "Create a FREE PREMIUM account"}
                    </button>
                    {!isRegistering && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", borderTop: `1px solid ${theme.border}`, paddingTop: "16px" }}>
                      <button style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "12px", cursor: "pointer", textDecoration: "underline", fontWeight: 500 }} onClick={() => setIsForgotPassword(true)}> Forgot Password? </button>
                      <button style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "12px", cursor: "pointer", textDecoration: "underline", fontWeight: 500 }} onClick={() => setIsResending(true)}> Resend Verification </button>
                    </div>
                    )}
                  </div>
                )
              ) : (
                // LOGGED IN VIEW
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "16px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "18px", fontWeight: 800, color: theme.navy }}>
                      👤 {user.username} {user.is_premium && <span style={{ color: "#d97706", fontSize: "14px", marginLeft: "6px" }}>★ Premium</span>}
                    </span>
                    <button onClick={handleLogout} style={{ fontSize: "12px", padding: "8px 12px", cursor: "pointer", backgroundColor: theme.bgOff, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, fontWeight: 700, color: theme.textMuted, transition: "all 0.2s" }} onMouseEnter={e => {e.currentTarget.style.backgroundColor = "#e2e8f0"; e.currentTarget.style.color = theme.text}} onMouseLeave={e => {e.currentTarget.style.backgroundColor = theme.bgOff; e.currentTarget.style.color = theme.textMuted}}>Logout</button>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <label style={{...labelStyle, margin: 0, fontSize: "14px"}}>⚙️ Account Settings</label>
                    <button onClick={() => setIsEditingProfile(!isEditingProfile)} style={{ fontSize: "12px", padding: "6px 10px", cursor: "pointer", backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "4px", fontWeight: 600, color: theme.blue }}>
                      {isEditingProfile ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>

                  {isEditingProfile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <input style={inputStyle} value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="New Username" />
                      <input style={inputStyle} type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email Address" />
                      <input style={inputStyle} type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="New Password" />
                      
                      <button onClick={handleUpdateProfile} style={{ width: "100%", padding: "12px", backgroundColor: theme.navy, color: "white", border: "none", borderRadius: theme.radiusSm, fontWeight: "bold", cursor: "pointer", marginTop: "8px", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.blue} onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.navy}>
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: "14px", color: theme.text, lineHeight: 1.8, backgroundColor: theme.bgOff, padding: "16px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
                      <p style={{ margin: "0 0 8px 0" }}><strong style={{color: theme.textMuted}}>Username:</strong> {user.username}</p>
                      <p style={{ margin: "0 0 8px 0" }}><strong style={{color: theme.textMuted}}>Email:</strong> {user.email || <span style={{color: "#999"}}>Not provided</span>}</p>
                      <p style={{ margin: "0" }}><strong style={{color: theme.textMuted}}>Account Type:</strong> {user.is_premium ? "Premium Authority" : "Free User"}</p>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              )}
            </div>
  );
}
