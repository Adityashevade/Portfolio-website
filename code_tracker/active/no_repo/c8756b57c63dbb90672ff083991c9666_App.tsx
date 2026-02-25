ƒimport { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { OverrideForm } from "./pages/Overrides/OverrideForm";
import { OverrideList } from "./pages/Overrides/OverrideList";
import { AuditLog } from "./pages/Audit/AuditLog";
import { AuditHistory } from "./pages/Audit/AuditHistory";
import { AliasList } from "./pages/Aliases/AliasList";
import { AliasForm } from "./pages/Aliases/AliasForm";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />

              <Route path="overrides" element={<OverrideList />} />
              <Route path="overrides/new" element={<OverrideForm />} />
              <Route path="overrides/:id" element={<OverrideForm />} />

              <Route path="audit" element={<AuditLog />} />
              <Route path="audit/overrides/:id" element={<AuditHistory />} />

              <Route path="aliases" element={<AliasList />} />
              <Route path="aliases/new" element={<AliasForm />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
  *cascade08 â*cascade08â∑ *cascade08∑¡ *cascade08¡Ê*cascade08ÊÁ*cascade08ÁË *cascade08ËÎ*cascade08ÎÏ *cascade08ÏÓ*cascade08ÓÄ *cascade08ÄÅ*cascade08ÅÇ *cascade08ÇÜ*cascade08Üà *cascade08àâ*cascade08âä *cascade08äç*cascade08çé *cascade08éê*cascade08êú *cascade08úû*cascade08ûü *cascade08ü°*cascade08°£ *cascade08£§*cascade08§∂ *cascade08∂∑*cascade08∑π *cascade08πª*cascade08ªæ *cascade08æø*cascade08ø¿ *cascade08¿¡*cascade08¡√ *cascade08√∆*cascade08∆» *cascade08»…*cascade08…Î*cascade08ÎÓ *cascade08Ó´*cascade08´¨ *cascade08¨ø*cascade08ø¿ *cascade08¿√*cascade08√ƒ *cascade08ƒ∆*cascade08∆« *cascade08«À*cascade08ÀÃ *cascade08Ã›*cascade08›ﬂ *cascade08ﬂ‡*cascade08‡· *cascade08·Ë*cascade08ËÈ *cascade08ÈÓ*cascade08ÓÔ *cascade08Ô˚*cascade08˚¸ *cascade08¸˝*cascade08˝˛ *cascade08˛Ö*cascade08ÖÜ *cascade08Üà*cascade08àâ *cascade08âè*cascade08èê *cascade08êë*cascade08ëí *cascade08íú*cascade08úù *cascade08ùü*cascade08ü† *cascade08†¢*cascade08¢¶ *cascade08¶®*cascade08®© *cascade08©ª *cascade08ªÄ*cascade08Äç *cascade08çé *cascade08éò*cascade08òô *cascade08ô§*cascade08§ß *cascade08ß©*cascade08©™ *cascade08™∞ *cascade08∞≤*cascade08≤  *cascade08 Ã*cascade08Ã’ *cascade08’◊*cascade08◊· *cascade08·á *cascade08áâ*cascade08âã *cascade08ãï*cascade08ï¨ *cascade08¨≠*cascade08≠Æ *cascade08Æ±*cascade08±≤ *cascade08≤≥*cascade08≥Ω *cascade08Ωæ*cascade08æ¿ *cascade08¿ *cascade08 Ã*cascade08ÃÇ	 *cascade08Ç	Ñ	*cascade08Ñ	Ü	 *cascade08Ü	ê	*cascade08ê	Ã	 *cascade08Ã	÷	*cascade08÷	ÿ	*cascade08ÿ	ë
 *cascade08ë
ì
*cascade08ì
ï
*cascade08ï
ñ
 *cascade08ñ
ó
 *cascade08ó
°
*cascade08°
»
 *cascade08»
…
 *cascade08…
 
*cascade08 
À
 *cascade08À
—
 *cascade08—
€
*cascade08€
›
*cascade08›
û *cascade08û†*cascade08†¢ *cascade08¢¨*cascade08¨ﬂ *cascade08ﬂÈ*cascade08ÈÎ*cascade08Îü *cascade08ü† *cascade08†°*cascade08°´*cascade08´¨*cascade08¨µ *cascade08µ∑*cascade08∑… *cascade08… *cascade08 – *cascade08–—*cascade08—‚ *cascade08‚‰ *cascade08‰Ë*cascade08ËÍ*cascade08Íˆ *cascade08ˆ˜*cascade08˜˚ *cascade08˚¸*cascade08¸â *cascade08âû*cascade08ûƒ *cascade0821file:///c:/SCOUTNEW/scout_db/frontend/src/App.tsx