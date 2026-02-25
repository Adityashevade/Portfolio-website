Ê*import { Bell, Check, Info, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for notifications
const INITIAL_NOTIFICATIONS = [
    {
        id: 1,
        title: "Override Approved",
        message: "Log4j vulnerability override has been approved.",
        time: "2 mins ago",
        type: "success",
        read: false
    },
    {
        id: 2,
        title: "New Alias Suggestion",
        message: "System detected potential alias for 'requests'.",
        time: "1 hour ago",
        type: "info",
        read: false
    },
    {
        id: 3,
        title: "Audit Log Export",
        message: "Your export for last month's audit logs is ready.",
        time: "5 hours ago",
        type: "success",
        read: true
    },
    {
        id: 4,
        title: "System Maintenance",
        message: "Scheduled maintenance in 24 hours.",
        time: "1 day ago",
        type: "warning",
        read: true
    }
];

export function Notifications() {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [open, setOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check className="h-4 w-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative transition-transform hover:scale-105">
                    <Bell className="h-6 w-6 text-muted-foreground hover:text-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full bg-red-500 border-2 border-background animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary" onClick={markAllAsRead}>
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 flex gap-3 text-sm hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="mt-1 flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className={`font-medium leading-none ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-muted-foreground text-xs line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/70 pt-1">
                                            {notification.time}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
Ò *cascade08Òˆˆ˜ *cascade08˜¯*cascade08¯∞ *cascade08
∞ª ª‰ *cascade08‰Ë*cascade08Ëâ *cascade08âã*cascade08ãü *cascade08ü°*cascade08°˙ *cascade08˙˛*cascade08˛§ *cascade08§®*cascade08®∞ *cascade08∞≤*cascade08≤¬ *cascade08¬ƒ*cascade08ƒÀ *cascade08Àœ*cascade08œ® *cascade08®¨*cascade08¨‘ *cascade08‘’*cascade08’Ò *cascade08ÒÙ*cascade08Ù˙ *cascade08˙˛*cascade08˛µ *cascade08µπ*cascade08π˛ *cascade08˛Ç*cascade08ÇÀ *cascade08Àœ*cascade08œ“ *cascade08“’*cascade08’ı *cascade08ıˆ*cascade08ˆú  *cascade08ú † *cascade08† Ç! *cascade08Ç!Ü!*cascade08Ü!é! *cascade08é!ë!*cascade08ë!±! *cascade08±!≤!*cascade08≤!÷! *cascade08÷!⁄!*cascade08⁄!ñ# *cascade08ñ#ö#*cascade08ö#∞# *cascade08∞#≤#*cascade08≤#÷# *cascade08÷#ÿ#*cascade08ÿ#ﬁ# *cascade08ﬁ#‚#*cascade08‚#Í$ *cascade08Í$Ó$*cascade08Ó$Ü% *cascade08Ü%á%*cascade08á%´% *cascade08´%Æ%*cascade08Æ%¥% *cascade08¥%∏%*cascade08∏%ó& *cascade08ó&õ&*cascade08õ&¸& *cascade08¸&Ä'*cascade08Ä'Ü' *cascade08Ü'ä'*cascade08ä'“' *cascade08“'÷'*cascade08÷'' *cascade08'Ù'*cascade08Ù'Ä) *cascade08Ä)Ñ)*cascade08Ñ)à) *cascade08à)ã)*cascade08ã)ß) *cascade08ß)®)*cascade08®)∞) *cascade08∞)¥)*cascade08¥)Â) *cascade08Â)È)*cascade08È)Ò) *cascade08Ò)Û)*cascade08Û)É* *cascade08É*Ö**cascade08Ö*â* *cascade08â*ç**cascade08ç*õ* *cascade08õ*•*•*®* *cascade08®*¨**cascade08¨*Ê* *cascade082Mfile:///c:/SCOUTNEW/scout_db/frontend/src/components/shared/Notifications.tsx