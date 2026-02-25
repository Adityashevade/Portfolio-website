Ê7import { Link, useLocation, Outlet } from "react-router-dom";
import { Copy, History, Shield, LayoutDashboard } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { PageTransition } from "@/components/shared/PageTransition";
import { Notifications } from "@/components/shared/Notifications";

// ...

const NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Overrides", href: "/overrides", icon: Shield },
    { label: "Audit Log", href: "/audit", icon: History },
    { label: "Aliases", href: "/aliases", icon: Copy },
];


export function Layout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/20 selection:text-primary">
            {/* Kaleido Sidebar: Expanding Drawer Design */}
            <aside className="fixed inset-y-0 left-0 z-50 w-20 hover:w-64 flex flex-col py-6 gap-6 bg-[#0f111a]/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out group overflow-hidden shadow-2xl">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-5 mb-2 whitespace-nowrap">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)] shrink-0 transition-transform group-hover:scale-105">
                        <Shield className="w-5 h-5 text-primary fill-primary/20" />
                    </div>
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        <span className="text-xl font-bold tracking-tight text-foreground">Scout DB</span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col gap-2 px-3 w-full">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "relative flex items-center h-12 rounded-xl px-3 transition-all duration-200 overflow-hidden whitespace-nowrap",
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_-5px_rgba(34,211,238,0.3)]"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("w-6 h-6 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />

                                <span className={cn(
                                    "ml-4 font-medium transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 delay-75",
                                    isActive ? "text-primary" : "text-foreground"
                                )}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_2px_rgba(34,211,238,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Status / User */}
                <div className="px-3 flex flex-col gap-2">
                    <div className="flex justify-center w-full">
                        <ModeToggle />
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap overflow-hidden">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                            <div className="w-full h-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500" />
                        </div>
                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            <span className="text-sm font-medium text-foreground">Admin User</span>
                            <span className="text-xs text-muted-foreground">admin@scoutdb.io</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 pl-20 relative">
                {/* Header: Transparent & Minimal */}
                <header className="h-24 flex items-center justify-between px-10 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {NAV_ITEMS.find(item => location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href)))?.label || "Mission Control"}
                        </h1>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                            ORG: SC0UT-DB / ENV: PRODUCTION
                        </p>
                    </motion.div>

                    <div className="flex items-center gap-6">
                        {/* Environment Pill */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            System Online
                        </div>
                        <Notifications />
                    </div>
                </header>

                <div className="p-8 max-w-[1600px] mx-auto space-y-8 min-h-[calc(100vh-6rem)]">
                    <AnimatePresence mode="wait">
                        <PageTransition key={location.pathname}>
                            <Outlet />
                        </PageTransition>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
] *cascade08]n*cascade08n‡ *cascade08‡ *cascade08½½× *cascade08×›*cascade08›*cascade08Ÿ *cascade08Ÿ£*cascade08£¥ *cascade08¥¨*cascade08¨« *cascade08«¬ *cascade08¬­ *cascade08­¶*cascade08¶· *cascade08·¸*cascade08¸¹ *cascade08¹º*cascade08º¼ *cascade08¼¿*cascade08¿Â *cascade08ÂÃ*cascade08ÃÄ *cascade08ÄÅ*cascade08ÅÆ *cascade08ÆË*cascade08ËÍ *cascade08ÍÏ*cascade08ÏĞ *cascade08ĞÕ*cascade08ÕÖ *cascade08Ö×*cascade08×Ø *cascade08ØÛ*cascade08ÛŞ *cascade08Şâ*cascade08âä *cascade08äê*cascade08êë *cascade08ëì*cascade08ìí *cascade08íï*cascade08ïñ *cascade08ñó*cascade08óö *cascade08ö÷ *cascade08÷ù*cascade08ù° *cascade08°µ *cascade08µ° *cascade08°²*cascade08²³ *cascade08³º*cascade08ºÏ *cascade08ÏÙ*cascade08Ùˆ*cascade08ˆœ *cascade08œ¤*cascade08¤« *cascade08«­ *cascade08­°*cascade08°± *cascade08±³*cascade08³· *cascade08·½*cascade08½Ä *cascade08Äè *cascade08èí*cascade08íî *cascade08îñ*cascade08ñò *cascade08òó*cascade08óô *cascade08ôõ*cascade08õö *cascade08ö÷*cascade08÷ø *cascade08øù*cascade08ùú *cascade08úü*cascade08üı *cascade08ış *cascade08şÿ *cascade08ÿ€ *cascade08€ *cascade08‚*cascade08‚„ *cascade08„…*cascade08…† *cascade08†ˆ*cascade08ˆ‰ *cascade08‰”*cascade08”¢ *cascade08¢£ *cascade08£¥ *cascade08¥¦*cascade08¦§ *cascade08§ª*cascade08ª« *cascade08«¬*cascade08¬­ *cascade08­¯*cascade08¯° *cascade08°º*cascade08º»*cascade08»¼ *cascade08¼½ *cascade08½¾*cascade08¾¿ *cascade08¿Ã*cascade08ÃÄ *cascade08ÄÅ*cascade08ÅÆ *cascade08ÆÇ*cascade08ÇË *cascade08ËÍ*cascade08ÍÎ *cascade08ÎÒ*cascade08ÒÓ *cascade08ÓÔ*cascade08Ô× *cascade08×Ø*cascade08ØÙ *cascade08ÙÛ*cascade08ÛŞ *cascade08Şß*cascade08ßá *cascade08áâ*cascade08âã *cascade08ãå *cascade08å®	*cascade08®	²	 *cascade08²	´	 *cascade08´	Ç	*cascade08Ç	È	 *cascade08È	Ì	*cascade08Ì	Í	 *cascade08Í	Î	*cascade08Î	Ï	 *cascade08Ï	Ó	*cascade08Ó	õ	 *cascade08õ	Ï
*cascade08Ï
á
 *cascade08á
è
*cascade08è
é
 *cascade08é
ï
*cascade08ï
ğ
 *cascade08ğ
ó
 *cascade08ó
ô
*cascade08ô
ø
 *cascade08ø
ù
*cascade08ù
ú
 *cascade08ú
û
 *cascade08û
ş
*cascade08ş
€ *cascade08€‰*cascade08‰Š *cascade08Š“*cascade08“• *cascade08•³*cascade08³º *cascade08º»*cascade08»Á *cascade08ÁÉ*cascade08ÉÊ *cascade08ÊË*cascade08ËÌ *cascade08ÌÎ *cascade08ÎÏ*cascade08ÏĞ *cascade08ĞÑ*cascade08ÑÓ *cascade08Óã*cascade08ãä *cascade08äæ*cascade08æç *cascade08çø*cascade08ø¬*cascade08¬° *cascade08°±*cascade08±Å *cascade08ÅÈ*cascade08ÈÉ *cascade08ÉÊ*cascade08ÊË *cascade08ËÎ*cascade08Îİ *cascade08İŞ*cascade08Şá *cascade08áâ*cascade08âï *cascade08ïÿ*cascade08ÿ• *cascade08•±*cascade08±»*cascade08»Á *cascade08ÁÅ*cascade08ÅÆ *cascade08ÆË *cascade08ËÎ*cascade08ÎÏ *cascade08ÏĞ*cascade08ĞÑ *cascade08ÑÒ*cascade08ÒÚ *cascade08ÚŞ*cascade08Şà *cascade08àá*cascade08áâ *cascade08âã*cascade08ãŒ *cascade08Œœ*cascade08œ *cascade08¤*cascade08¤¥ *cascade08¥¦*cascade08¦§ *cascade08§« *cascade08«™ *cascade08™Ò*cascade08Òç *cascade08çè*cascade08èç *cascade08çğ *cascade08ğ‚ *cascade08‚ƒ*cascade08ƒ„ *cascade08„… *cascade08…†*cascade08†‡ *cascade08‡ *cascade08*cascade08‘ *cascade08‘–*cascade08–— *cascade08—¢ *cascade08¢¤*cascade08¤¥ *cascade08¥¨*cascade08¨© *cascade08©¯ *cascade08¯°*cascade08°² *cascade08²Ô*cascade08Ô² *cascade08²´ *cascade08´¶*cascade08¶· *cascade08·»*cascade08»¾*cascade08¾À *cascade08ÀÁ *cascade08ÁÃ*cascade08ÃË *cascade08ËÍ*cascade08ÍÏ *cascade08ÏĞ*cascade08ĞÒ *cascade08ÒÔ*cascade08ÔÕ *cascade08ÕÖ*cascade08Ö× *cascade08×ä*cascade08äå *cascade08åë*cascade08ëì *cascade08ìñ *cascade08ñò*cascade08òö *cascade08ö÷ *cascade08÷û*cascade08ûü *cascade08üş *cascade08şÿ *cascade08ÿ *cascade08*cascade08 *cascade08İ *cascade08İà*cascade08àâ *cascade08âä *cascade08äõ *cascade08õù*cascade08ùü *cascade08üı*cascade08ı€ *cascade08€‚ *cascade08‚„*cascade08„‡ *cascade08‡ˆ*cascade08ˆ‰ *cascade08‰‹*cascade08‹ *cascade08‘*cascade08‘– *cascade08–œ*cascade08œ *cascade08« *cascade08«¬*cascade08¬­ *cascade08­¯*cascade08¯° *cascade08°·*cascade08·¼ *cascade08¼Â*cascade08ÂÃ *cascade08ÃÆ*cascade08ÆÇ *cascade08ÇÈ*cascade08ÈË *cascade08ËÑ*cascade08ÑÔ *cascade08Ô× *cascade08×Ù*cascade08Ùû *cascade08ûı*cascade08ı *cascade08‰*cascade08‰Š *cascade08Š*cascade08² *cascade08²µ *cascade08µ¸*cascade08¸¹ *cascade08¹º*cascade08º» *cascade08»¼*cascade08¼¾ *cascade08¾¿*cascade08¿À *cascade08ÀÁ*cascade08ÁÄ *cascade08ÄÆ*cascade08ÆÈ *cascade08ÈË*cascade08ËÌ *cascade08ÌÏ*cascade08ÏÒ *cascade08ÒÖ*cascade08ÖØ *cascade08Øâ*cascade08âã *cascade08ãí *cascade08íî*cascade08îú *cascade08úû*cascade08ûü *cascade08ü” *cascade08”®*cascade08®°*cascade08°± *cascade08±² *cascade08²³*cascade08³´ *cascade08´Å*cascade08ÅÆ *cascade08ÆŞ*cascade08Şß *cascade08ßà *cascade08àá*cascade08áâ *cascade08âå*cascade08åæ *cascade08æî*cascade08îï *cascade08ïğ*cascade08ğñ *cascade08ñó*cascade08óô *cascade08ô÷*cascade08÷ø *cascade08øù*cascade08ùú *cascade08úû*cascade08ûı *cascade08ış*cascade08ş€ *cascade08€*cascade08‚ *cascade08‚ƒ*cascade08ƒ„ *cascade08„†*cascade08†‡ *cascade08‡Š*cascade08Š‹ *cascade08‹¯*cascade08¯° *cascade08°Ö*cascade08Öâ *cascade08âı *cascade08ıØ*cascade08Øß *cascade08ßá*cascade08á *cascade08Ÿ*cascade08Ÿ¢ *cascade08¢£*cascade08£§ *cascade08§®*cascade08®¯ *cascade08¯° *cascade08°³*cascade08³µ*cascade08µ·*cascade08·¸ *cascade08¸¹ *cascade08¹¼*cascade08¼½ *cascade08½¾ *cascade08¾Á*cascade08ÁÂ *cascade08ÂÃ *cascade08ÃÄ*cascade08ÄÅ *cascade08ÅÊ*cascade08ÊÌ *cascade08ÌÓ*cascade08ÓÔ *cascade08ÔÖ*cascade08Ö× *cascade08×Ù*cascade08ÙÚ *cascade08Úå*cascade08åæ *cascade08æè*cascade08èì *cascade08ì *cascade08*cascade08– *cascade08–¨ *cascade08¨¯*cascade08¯Ä *cascade08ÄÔ *cascade08ÔØ *cascade08Øì*cascade08ìí *cascade08íó *cascade08ó À" *cascade08À"Á"*cascade08Á"Â" *cascade08Â"Ã" *cascade08Ã"Ä"*cascade08Ä"Å" *cascade08Å"È" *cascade08È"É"*cascade08É"Ê" *cascade08Ê"Ë" *cascade08Ë"Î"*cascade08Î"Ğ" *cascade08Ğ"Ú"*cascade08Ú"Û" *cascade08Û"ß"*cascade08ß"à" *cascade08à"æ"*cascade08æ"î" *cascade08î"ğ"*cascade08ğ"ö" *cascade08ö"ü" *cascade08ü"€# *cascade08€##*cascade08#‚#*cascade08‚#ƒ# *cascade08ƒ#„# *cascade08„#†#*cascade08†#‡# *cascade08‡#ˆ# *cascade08ˆ#Œ# *cascade08Œ#”#*cascade08”#©# *cascade08©#¬#*cascade08¬#¸# *cascade08¸#¹#*cascade08¹#º# *cascade08º#¾#*cascade08¾#¿# *cascade08¿#Â#*cascade08Â#Ã# *cascade08Ã#È#*cascade08È#É# *cascade08É#Ê#*cascade08Ê#Ì# *cascade08Ì#Í#*cascade08Í#Î# *cascade08Î#Ğ#*cascade08Ğ#Ó# *cascade08Ó#Õ#*cascade08Õ#Ö# *cascade08Ö#Ú#*cascade08Ú#Û# *cascade08Û#Ü#*cascade08Ü#Ş# *cascade08Ş#ß#*cascade08ß#á# *cascade08á#â#*cascade08â#ä# *cascade08ä#å#*cascade08å#è# *cascade08è#ê#*cascade08ê#ì# *cascade08ì#ô#*cascade08ô#÷# *cascade08÷#ø# *cascade08ø#ú# *cascade08ú#ü#*cascade08ü#ı# *cascade08ı#ş#*cascade08ş#ÿ# *cascade08ÿ#€$*cascade08€$‚$ *cascade08‚$ƒ$*cascade08ƒ$…$ *cascade08…$°'*cascade08°'€( *cascade08€(…(*cascade08…(±( *cascade08±(²( *cascade08²(³(*cascade08³(´( *cascade08´(¸(*cascade08¸(¹( *cascade08¹(İ(*cascade08İ(á( *cascade08á(æ(*cascade08æ(ç( *cascade08ç(ë(*cascade08ë(í( *cascade08í(ï(*cascade08ï(ò( *cascade08ò(õ(*cascade08õ(ˆ) *cascade08ˆ)‹)*cascade08‹)Œ) *cascade08Œ))*cascade08)œ) *cascade08œ))*cascade08)±) *cascade08±)Á)*cascade08Á)Ä) *cascade08Ä)Ø)*cascade08Ø)Ü) *cascade08Ü)Ş)*cascade08Ş)ß) *cascade08ß)æ)*cascade08æ)÷) *cascade08÷)ø) *cascade08ø)ú)*cascade08ú)‹* *cascade08‹***cascade08** *cascade08*‘**cascade08‘*’* *cascade08’*«* *cascade08«*²**cascade08²*µ* *cascade08µ*æ* *cascade08æ*ç**cascade08ç* + *cascade08 +¡+*cascade08¡+Á+ *cascade08Á+Ã+*cascade08Ã+Å+ *cascade08Å+Ç+*cascade08Ç+È+ *cascade08È+É+*cascade08É+Ê+ *cascade08Ê+Ë+*cascade08Ë+Ì+ *cascade08Ì+Î+*cascade08Î+Ï+ *cascade08Ï+Ó+*cascade08Ó+Ô+ *cascade08Ô+Ù+*cascade08Ù+Ú+ *cascade08Ú+Ü+*cascade08Ü+İ+ *cascade08İ+ñ+*cascade08ñ+Š, *cascade08Š,‹, *cascade08‹,,*cascade08,–, *cascade08–,—, *cascade08—,š, *cascade08š,›,*cascade08›,, *cascade08,¢,*cascade08¢,£, *cascade08£,¦,*cascade08¦,§, *cascade08
§,¨, ¨,°,*cascade08
°,±, ±,³,*cascade08
³,´, ´,¼,*cascade08
¼,¾, ¾,Ã,*cascade08
Ã,Ä, Ä,Å,*cascade08
Å,Æ, Æ,Ë,*cascade08
Ë,Ì, Ì,Í,*cascade08Í,Ï, *cascade08Ï,Ô,*cascade08Ô,è, *cascade08è,-*cascade08
-‚- ‚-‚.*cascade08
‚.. .¡.*cascade08¡.». *cascade08».½.*cascade08½.¾. *cascade08¾.Ä.*cascade08Ä.Å. *cascade08Å.Ç.*cascade08Ç.È. *cascade08È.Ğ.*cascade08Ğ.Ñ. *cascade08Ñ.ß.*cascade08ß.à. *cascade08à.æ.*cascade08æ.ç. *cascade08ç.ğ.*cascade08ğ.ñ. *cascade08ñ.÷.*cascade08÷.•/ *cascade08•/˜/*cascade08˜/š/ *cascade08š/¢/*cascade08¢/£/ *cascade08£/´/*cascade08´/Î/ *cascade08Î/Ô/*cascade08Ô/ç/ *cascade08ç/ù/*cascade08ù/0 *cascade080‘0*cascade08‘00 *cascade080¡0*cascade08¡0¢0 *cascade08¢0§0*cascade08§0¨0 *cascade08¨0®0*cascade08®0°0 *cascade08°0±0*cascade08±0³0 *cascade08³0´0*cascade08´0µ0 *cascade08µ0¶0*cascade08¶0Ï0*cascade08Ï0Ğ0 *cascade08Ğ0Ñ0*cascade08Ñ0Ò0 *cascade08Ò0è0*cascade08è01*cascade081ƒ1 *cascade08ƒ1†1*cascade08†1’1 *cascade08’11*cascade081 1 *cascade08 1¢1*cascade08¢1£1 *cascade08£1¦1*cascade08¦1§1 *cascade08§1µ1*cascade08µ1¶1 *cascade08¶1¿1*cascade08¿1À1 *cascade08À1Á1*cascade08Á1Â1 *cascade08Â1Ã1*cascade08Ã1Ä1 *cascade08Ä1Ç1*cascade08Ç1È1 *cascade08È1Ó1*cascade08Ó1Ô1 *cascade08Ô1İ1*cascade08İ1Ş1 *cascade08Ş1ß1*cascade08ß1á1 *cascade08á1â1*cascade08â1ã1 *cascade08ã1ä1*cascade08ä1å1 *cascade08å1è1*cascade08è1é1 *cascade08é1ò1*cascade08ò1ó1 *cascade08ó1ù1*cascade08ù1ú1 *cascade08ú1ş1*cascade08ş1ÿ1 *cascade08ÿ12*cascade082‡2 *cascade08‡22*cascade082˜2 *cascade08˜2™2*cascade08™2·2 *cascade08·2¹2*cascade08¹2º2 *cascade08º2¿2*cascade08¿2À2 *cascade08À2Á2*cascade08Á2Ô2*cascade08Ô2Õ2 *cascade08Õ2Ö2*cascade08Ö2×2 *cascade08×2ß2*cascade08ß2à2 *cascade08à2ğ2*cascade08ğ2ñ2 *cascade08ñ2ô2*cascade08ô2õ2 *cascade08õ2ù2*cascade08ù2ú2 *cascade08ú2€3*cascade08€3™3 *cascade08™33 *cascade083¤3*cascade08¤3¥3 *cascade08¥3­3*cascade08­3»3 *cascade08»3Æ3 *cascade08Æ3Ç3*cascade08Ç3”4 *cascade08”4¦4 *cascade08¦4©4*cascade08©4ª4 *cascade08ª4¬4*cascade08¬4¯4 *cascade08¯4±4*cascade08±4Ó4 *cascade08Ó4Ô4*cascade08Ô4Û4 *cascade08Û4á4*cascade08á4â4 *cascade08â4ã4*cascade08ã4ë4 *cascade08ë4õ4*cascade08õ45*cascade085§5 *cascade08§5¤6*cascade08¤6¬6 *cascade08¬6ÿ6*cascade08ÿ6Ê7 *cascade082?file:///c:/SCOUTNEW/scout_db/frontend/src/components/Layout.tsx