import { useState } from "react";
import { WatchlistPanel } from "./watchlist/WatchlistPanel";
import { NotesPanel } from "./notes/NotesPanel";
import { ComparePanel } from "./compare/ComparePanel";
import { ShortcutHelp } from "./shortcuts/ShortcutHelp";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";



export function AddonsModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState("watchlist");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add-ons</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          </TabsList>
          <TabsContent value="watchlist"><WatchlistPanel /></TabsContent>
          <TabsContent value="notes"><NotesPanel /></TabsContent>
          <TabsContent value="compare"><ComparePanel /></TabsContent>
          <TabsContent value="shortcuts"><ShortcutHelp /></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
