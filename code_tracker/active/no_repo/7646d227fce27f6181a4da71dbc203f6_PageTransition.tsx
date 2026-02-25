ˆ
import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.99 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Custom easeOutCubic-ish
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({ children, className = "", delay = 0.1 }: PageTransitionProps & { delay?: number }) {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: delay
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className = "" }: PageTransitionProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
*cascade08 *cascade0899‘ *cascade08‘ª*cascade08ªØ *cascade08Øè*cascade08èˆ *cascade08ˆŸ*cascade08Ÿ¡ *cascade08¡Ñ*cascade08ÑÒ *cascade08Òò*cascade08òó *cascade08ó†*cascade08†‡ *cascade08‡*cascade08 *cascade08«*cascade08«¬ *cascade08¬À*cascade08ÀÂ *cascade08Âá*cascade08áæ *cascade08æè*cascade08èé *cascade08éê*cascade08êë *cascade08ëú*cascade08úü *cascade08ü›*cascade08›œ *cascade08œ©*cascade08©ª *cascade08ª¾*cascade08¾¿ *cascade08¿•*cascade08•™ *cascade08™¤*cascade08¤¦ *cascade08¦©*cascade08©­ *cascade08­¦*cascade08¦Õ *cascade08ÕØ*cascade08ØÛ *cascade08ÛŞ*cascade08Şß *cascade08ßã*cascade08ãä *cascade08äó*cascade08óô *cascade08ôö*cascade08ö÷ *cascade08÷ù*cascade08ùú *cascade08ú*cascade08 *cascade08’*cascade08’“ *cascade08“”*cascade08”– *cascade08–—*cascade08—š *cascade08šµ*cascade08µÀ *cascade08ÀÂ*cascade08ÂÃ *cascade08ÃÊ*cascade08ÊË *cascade08Ëø*cascade08øû *cascade08ûå*cascade08åç *cascade08çù*cascade08ùˆ	 *cascade08ˆ	š	*cascade08š	›	 *cascade08›	Ÿ	*cascade08Ÿ	£	 *cascade08£	Æ	*cascade08Æ	Ç	 *cascade08Ç	Ò	*cascade08Ò	Ó	 *cascade08Ó	İ	*cascade08İ	Ş	 *cascade08Ş	ø	*cascade08ø	ù	 *cascade08ù	€
*cascade08€

 *cascade08
‚
*cascade08‚
ƒ
 *cascade08ƒ
‡
*cascade08‡
ˆ
 *cascade08ˆ
“
*cascade08“
”
 *cascade08”
œ
*cascade08œ

 *cascade08
®
*cascade08®
°
 *cascade08°
Ò
*cascade08Ò
Ó
 *cascade08Ó
Ô
*cascade08Ô
Ş
 *cascade08Ş
í
*cascade08í
ñ
 *cascade08ñ
ú
*cascade08ú
û
 *cascade08û
ı
*cascade08ı
ş
 *cascade08ş
ÿ
*cascade08ÿ
‚ *cascade08‚*cascade08­ *cascade08­®*cascade08®± *cascade08±²*cascade08²´ *cascade08´·*cascade08·Ã *cascade08ÃŞ*cascade08Şè *cascade08èê*cascade08êŒ *cascade08Œ*cascade08¶ *cascade08¶¸*cascade08¸¹ *cascade08¹Á*cascade08Áˆ *cascade082Nfile:///c:/SCOUTNEW/scout_db/frontend/src/components/shared/PageTransition.tsx