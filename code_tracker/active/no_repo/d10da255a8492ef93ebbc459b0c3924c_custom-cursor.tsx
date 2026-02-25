·
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export const CustomCursor = () => {
    const [isVisible, setIsVisible] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring for outer circle
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);

            // Check if hovering over the target area
            const target = e.target as HTMLElement;
            // Look for closest element with the specific class
            const isHoveringTarget = target.closest(".custom-cursor-area");

            if (isHoveringTarget) {
                if (!isVisible) setIsVisible(true);
                document.body.style.cursor = "none";
            } else {
                if (isVisible) setIsVisible(false);
                document.body.style.cursor = "auto";
            }
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
            document.body.style.cursor = "auto";
        };

        // We listen on window to track mouse even if it leaves the specific element, 
        // effectively handling the transition in/out of the target area
        window.addEventListener("mousemove", moveCursor);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
            document.body.style.cursor = "auto";
        };
    }, [mouseX, mouseY, isVisible]);

    if (!isVisible) return null;

    return (
        <>
            {/* Outer Circle - Delayed Spring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999]"
                style={{
                    x: springX,
                    y: springY,
                    translateX: "-50%",
                    translateY: "-50%"
                }}
            >
                <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    // Use CSS variables for strict theme control
                    "backdrop-blur-sm border-[2px] bg-[hsl(var(--cursor-ring)/0.2)] border-[hsl(var(--cursor-ring))]"
                )} />
            </motion.div>

            {/* Inner Dot - Instant Raw Mouse */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999]"
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: "-50%",
                    translateY: "-50%"
                }}
            >
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    // Use CSS variables
                    "bg-[hsl(var(--cursor-dot))] shadow-[0_0_10px_hsl(var(--cursor-dot)/0.5)]"
                )} />
            </motion.div>
        </>
    );
};
™ *cascade08™Â*cascade08Âö *cascade08öú*cascade08ú€ *cascade08€‚*cascade08‚„ *cascade08„…*cascade08… *cascade08¡*cascade08¡§ *cascade08§©*cascade08©« *cascade08«¬*cascade08¬Æ *cascade08ÆÊ*cascade08ÊÌ*cascade08ÌÍ *cascade08ÍÓ*cascade08ÓÔ *cascade08ÔÚ*cascade08ÚÛ *cascade08Ûä*cascade08äæ *cascade08æí *cascade08íñ*cascade08ñò *cascade08ò’ *cascade08’“*cascade08“  *cascade08 ¡*cascade08¡£ *cascade08£®*cascade08®³ *cascade08³·*cascade08·Ã *cascade08ÃÄ*cascade08ÄÑ *cascade08ÑÓ*cascade08ÓÕ *cascade08ÕÖ*cascade08Öé *cascade08éí*cascade08íù *cascade08ùú*cascade08ú‡ *cascade08‡‰*cascade08‰‹ *cascade08‹Œ*cascade08Œ¡ *cascade08¡¥*cascade08¥¸ *cascade08¸¼*cascade08¼ñ *cascade08ñõ*cascade08õ÷*cascade08÷ù *cascade08ùú*cascade08ú *cascade08*cascade08– *cascade08–™*cascade08™›*cascade08› *cascade08*cascade08± *cascade08±³*cascade08³» *cascade08»È*cascade08ÈË *cascade08ËĞ*cascade08ĞÑ *cascade08ÑÖ*cascade08Ö× *cascade08×Ø*cascade08ØÙ *cascade08ÙÛ*cascade08ÛÜ *cascade08Üİ*cascade08İŞ *cascade08Şá*cascade08áã *cascade08ãå*cascade08åç *cascade08çè*cascade08èî *cascade08îò*cascade08òü *cascade08üı*cascade08ış *cascade08ş€*cascade08€† *cascade08†‡*cascade08‡ˆ *cascade08ˆ*cascade08 *cascade08–*cascade08–˜ *cascade08˜›*cascade08›£ *cascade08£·*cascade08·¸ *cascade08¸¹*cascade08¹½ *cascade08½¿*cascade08¿À *cascade08ÀÁ*cascade08ÁÂ *cascade08ÂÃ*cascade08ÃÄ *cascade08ÄÆ*cascade08ÆÇ *cascade08ÇË*cascade08ËÌ *cascade08ÌÏ*cascade08ÏÑ *cascade08ÑÒ*cascade08ÒÓ *cascade08ÓÔ*cascade08ÔÕ *cascade08ÕÖ*cascade08Ö× *cascade08×Ú*cascade08Úİ *cascade08İŞ*cascade08Şà *cascade08àá*cascade08áå *cascade08åí*cascade08íï *cascade08ïğ*cascade08ğñ *cascade08ñò*cascade08òô *cascade08ô÷*cascade08÷ø *cascade08øú*cascade08úû *cascade08û€*cascade08€ *cascade08‡*cascade08‡ˆ *cascade08ˆ“*cascade08“• *cascade08•—*cascade08—™ *cascade08™›*cascade08›œ *cascade08œ¡*cascade08¡¢ *cascade08¢¦*cascade08¦§ *cascade08§¨*cascade08¨© *cascade08©½*cascade08½¾ *cascade08¾Â*cascade08ÂÅ *cascade08ÅË*cascade08ËÌ *cascade08Ìí*cascade08íî *cascade08î‚*cascade08‚ƒ *cascade08ƒ…*cascade08…‰ *cascade08‰•*cascade08•© *cascade08©«*cascade08«¬ *cascade08¬²*cascade08²³ *cascade08³¶*cascade08¶· *cascade08·¸*cascade08¸¹ *cascade08¹º*cascade08º» *cascade08»Í*cascade08ÍÎ *cascade08ÎĞ*cascade08ĞÑ *cascade08ÑÜ*cascade08Üİ *cascade08İğ*cascade08ğò *cascade08òô*cascade08ô÷ *cascade08÷ÿ*cascade08ÿ€	 *cascade08€	†	*cascade08†		 *cascade08	š	*cascade08š	ª	 *cascade08ª	¬	*cascade08¬	­	 *cascade08­	³	*cascade08³	´	 *cascade08´	¼	*cascade08¼	½	 *cascade08½	æ	*cascade08æ	ç	 *cascade08ç	è	*cascade08è	é	 *cascade08é	ê	*cascade08ê	û	 *cascade08û	ÿ	*cascade08ÿ	€
 *cascade08€
…
*cascade08…

 *cascade08
”
*cascade08”
•
 *cascade08•
 
*cascade08 
¤
 *cascade08¤
§
*cascade08§
­
 *cascade08­
µ
*cascade08µ
Ó
 *cascade08Ó
Ö
*cascade08Ö
Û
 *cascade08Û
ç
*cascade08ç
í
 *cascade08í
Œ*cascade08Œ *cascade08•*cascade08•– *cascade08– *cascade08 ¡ *cascade08¡æ*cascade08æç *cascade08çî*cascade08îğ *cascade08ğö*cascade08ö÷ *cascade08÷ı*cascade08ış *cascade08ş‰*cascade08‰š *cascade08š*cascade08Ü *cascade08Üß*cascade08ßó *cascade08óô*cascade08ôõ *cascade08õ÷*cascade08÷† *cascade08†Â*cascade08ÂÃ *cascade08ÃÅ*cascade08ÅÆ *cascade08ÆÊ*cascade08ÊÌ *cascade08Ìæ*cascade08æë *cascade08ëì*cascade08ìô *cascade08ô÷*cascade08÷Ã *cascade08ÃÇ*cascade08Çí *cascade08íï*cascade08ïó *cascade08óõ*cascade08õù *cascade08ùı*cascade08ı *cascade08ƒ*cascade08ƒ… *cascade08…†*cascade08†‰ *cascade08‰‹*cascade08‹ *cascade08*cascade08¡ *cascade08¡¥*cascade08¥Å *cascade08ÅÉ*cascade08É× *cascade08×Û*cascade08Ûß *cascade08ßà*cascade08àä *cascade08äè *cascade08èë*cascade08ëó*cascade08óô *cascade08ôú*cascade08úû *cascade08ûˆ*cascade08ˆ‰ *cascade08‰Š*cascade08Š‹ *cascade08‹Œ*cascade08Œ *cascade08*cascade08š *cascade08š*cascade08« *cascade08«­*cascade08­¹ *cascade08¹»*cascade08»„ *cascade08„ˆ*cascade08ˆ’ *cascade08’•*cascade08•¥ *cascade08¥¦*cascade08¦¯ *cascade08¯°*cascade08°³ *cascade08³·*cascade08·Ğ *cascade08ĞÑ*cascade08ÑÔ *cascade08ÔØ*cascade08ØÚ*cascade08Úæ *cascade08æû*cascade08û… *cascade08… *cascade08‘*cascade08‘£ *cascade08£± *cascade08±µ*cascade08µ¹*cascade08¹º*cascade08º¼ *cascade08¼À*cascade08ÀÂ *cascade08ÂÅ*cascade08ÅÆ*cascade08ÆÈ *cascade08ÈÌ*cascade08ÌØ *cascade08Ø*cascade08» *cascade08»¿*cascade08¿Ë *cascade08ËÏ*cascade08ÏÒ *cascade08ÒÔ*cascade08ÔÖ *cascade08Ö×*cascade08×Ø *cascade08ØÙ*cascade08ÙÚ *cascade08ÚÛ*cascade08Ûİ *cascade08İŞ *cascade08Şá*cascade08áâ *cascade08âã*cascade08ãä *cascade08äå*cascade08åè *cascade08èé*cascade08éë *cascade08ëì*cascade08ìï *cascade08ïô*cascade08ôö *cascade08ö÷*cascade08÷ø *cascade08øü*cascade08üş *cascade08ş‚*cascade08‚” *cascade08”š*cascade08š› *cascade08› *cascade08 ¡ *cascade08¡£*cascade08£¤ *cascade08¤² *cascade08²»*cascade08»¼ *cascade08¼Ä*cascade08ÄÆ *cascade08ÆÇ*cascade08ÇÉ *cascade08ÉÊ *cascade08ÊË*cascade08ËÍ *cascade08ÍÎ *cascade08ÎĞ*cascade08ĞÑ *cascade08ÑÙ *cascade08ÙÚ*cascade08ÚÛ *cascade08Ûß*cascade08ßá *cascade08áâ*cascade08âã *cascade08ãå*cascade08åæ *cascade08æé*cascade08éë *cascade08ëò*cascade08òõ *cascade08õø*cascade08ø„ *cascade08„…*cascade08…‡ *cascade08‡‰*cascade08‰Œ *cascade08Œ*cascade08˜ *cascade08˜©*cascade08©­*cascade08­Ã *cascade08Ã×*cascade08×Ü *cascade08Üä *cascade08äè*cascade08èõ *cascade08õù*cascade08ùû *cascade08û„ *cascade08„Î *cascade08ÎÒ*cascade08ÒÜ *cascade08Üà*cascade08àü *cascade08üş*cascade08ş *cascade08*cascade08œ *cascade08œ *cascade08 Å *cascade08ÅÈ*cascade08ÈØ *cascade08ØÙ*cascade08Ùù *cascade08ùı*cascade08ı *cascade08…*cascade08…• *cascade08•œ *cascade08œ *cascade08 µ *cascade08µ¹*cascade08¹â *cascade08âã*cascade08ãó *cascade08óö*cascade08öù *cascade08ùû*cascade08ûı *cascade08ı‚*cascade08‚„ *cascade08„… *cascade08…ˆ*cascade08ˆ‰ *cascade08‰Š*cascade08Šœ *cascade08œ *cascade08 ª*cascade08ª¬ *cascade08¬³*cascade08³µ *cascade08µ¶*cascade08¶¹ *cascade08¹¼*cascade08¼Î *cascade08ÎÑ*cascade08ÑÒ *cascade08ÒÓ*cascade08ÓÕ *cascade08ÕÖ*cascade08Ö× *cascade08×Ú*cascade08ÚÜ *cascade08Üß*cascade08ßá *cascade08áä*cascade08äé *cascade08éø *cascade08øü*cascade08üƒ *cascade08ƒ‡*cascade08‡¢ *cascade08¢¦*cascade08¦«*cascade08«¯*cascade08¯· *cascade082Ifile:///C:/SCOUTNEW/scout_db/frontend/src/components/ui/custom-cursor.tsx