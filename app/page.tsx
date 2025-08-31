"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  ShoppingCart,
  Trash2,
  Search,
  Volume2,
  VolumeX,
  Info,
  Languages,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { searchItem } from "@/lib/search";
import Loader from "@/components/Loader";
import { toast } from "sonner";
import useShoppingList from "@/hooks/useShoppingList";

const commandMap: Record<string, string> = {
  add: "add", remove: "remove", delete: "remove", move: "remove", clear: "clear", search: "search", find: "find",
  "जोड़ो": "add", "हटाओ": "remove", "मिटाओ": "remove", "साफ": "clear", "ढूंढो": "search",
};

const itemTranslations: Record<string, string> = {
  "चावल": "rice", "सेब": "apple", "दूध": "milk", "नमक": "salt", "चीनी": "sugar",
};

function cleanCommand(cmd: string): string {
  return cmd.replace(/\b(to my list|to the list|in my list|into my list|to list)\b/g, "").replace(/[.?!।]$/g, "").trim();
}

export default function VoiceShoppingAssistant() {
  const {
    items, addItem, removeItemByName, increaseQuantity, decreaseQuantity, toggleItem, clearList, groupedItems, totalCost,
  } = useShoppingList();
  const [lastCommand, setLastCommand] = useState("");
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [language, setLanguage] = useState("en-US");

  const { transcript, listening, startListening, stopListening, error: speechError } = useSpeechRecognition(language);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const lastProcessedRef = useRef<string>("");
  const voiceSearchTriggered = useRef(false);

  useEffect(() => {
    if ("speechSynthesis" in window) synthRef.current = window.speechSynthesis;
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (items.length === 0) {
        setSmartSuggestions([]);
        return;
      }
      try {
        const itemNames = items.map((i) => i.name.toLowerCase());
        const response = await fetch('https://kanan1612.pythonanywhere.com/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: itemNames }),
        });
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const suggestions = await response.json();
        setSmartSuggestions(suggestions.slice(0, 5));
      } catch (error) {
        console.error("Could not fetch suggestions:", error);
        toast.error("Could not load smart suggestions from the server.");
        setSmartSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [items]);

  const speak = useCallback((text: string) => {
    if (speechEnabled && synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      synthRef.current.speak(utterance);
    }
  }, [speechEnabled, language]);

  useEffect(() => {
    if (speechError) toast.error(`Speech Recognition Error: ${speechError}`);
  }, [speechError]);

  useEffect(() => {
    if (!transcript || listening) return;
    
    const cmd = cleanCommand(transcript.toLowerCase().trim());
    if (lastProcessedRef.current === cmd) return;
    lastProcessedRef.current = cmd;
    setLastCommand(cmd);

    let action: string | null = null;
    let itemStr: string = "";
    const words = cmd.split(' ');
    let commandWord: string | null = null;

    for (const word of words) {
        if (commandMap[word]) {
            action = commandMap[word];
            commandWord = word;
            break;
        }
    }

    if (!action) return;

    itemStr = words.filter(word => word !== commandWord).join(' ');
    const finalItem = itemTranslations[itemStr] || itemStr;

    if (!finalItem && (action === "add" || action === "remove" || action === "search")) return;

    if (action === "add") {
      addItem(finalItem);
      speak(`Added ${finalItem}`);
      toast.success(`✅ ${finalItem} added to your list`);
    } else if (action === "remove") {
      if (removeItemByName(finalItem)) {
        speak(`Removed ${finalItem}`);
        toast.info(`🗑️ ${finalItem} removed from your list`);
      } else {
        speak(`Could not find ${finalItem} in your list.`);
        toast.error(`❌ Could not find "${finalItem}" in your list.`);
      }
    } else if (action === "clear") {
      clearList();
      speak("Cleared your list");
      toast.warning("⚠️ List cleared");
    } else if (action === "search") {
      voiceSearchTriggered.current = true;
      setSearchQuery(finalItem);
    }
  }, [transcript, listening, addItem, removeItemByName, clearList, speak]);
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const searchTimer = setTimeout(() => {
      searchItem(searchQuery)
        .then(results => {
          setSearchResults(results);
          if (voiceSearchTriggered.current) {
            if (results.length > 0) {
              speak(`Found ${results.length} item${results.length > 1 ? "s" : ""} for ${searchQuery}`);
              toast(`🔍 Found ${results.length} item(s) for "${searchQuery}"`);
            } else {
              speak(`No items found for ${searchQuery}`);
              toast.error(`❌ No items found for "${searchQuery}"`);
            }
            voiceSearchTriggered.current = false;
          }
        })
        .catch(() => toast.error("An error occurred during search."))
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery, speak]);

  return (
    <div className="min-h-screen bg-background p-4 font-sans text-foreground">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center p-4">
          <h1 className="text-4xl md:text-5xl font-extrabold flex items-center justify-center gap-3 text-primary">
            <ShoppingCart className="h-10 w-10" />
            Voice Shopping Assistant
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Your smart, voice-powered shopping list
          </p>
        </header>

        <main className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Voice Commands
                  <div className="flex items-center gap-2">
                    <Languages className="text-muted-foreground" />
                    <select
                      value={language}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value)}
                      className="border rounded p-1 text-sm bg-secondary"
                    >
                      <option value="en-US">English</option>
                      <option value="hi-IN">Hindi</option>
                    </select>
                    <Button variant="outline" size="icon" onClick={() => setSpeechEnabled(!speechEnabled)} className="rounded-full">
                      {speechEnabled ? <Volume2 /> : <VolumeX />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <Button size="lg" onClick={listening ? stopListening : startListening}
                  className={`rounded-full w-24 h-24 shadow-lg transition-all duration-300 ${
                    listening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-primary hover:bg-primary/90"
                  }`}>
                  {listening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                </Button>
                {listening && <Loader />}
                <div className="mt-4 text-sm text-muted-foreground flex items-start gap-2 p-2 bg-secondary rounded-md w-full">
                  <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-left">
                    Try: <b>“Add 2 apples”</b>, <b>“Remove apple”</b>, <b>“Find milk”</b>, or <b>“Clear list”</b>
                  </span>
                </div>
                {transcript && <p className="text-center mt-2 p-2 bg-muted rounded w-full">"{transcript}"</p>}
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search /> Search</CardTitle>
              </CardHeader>
              <CardContent>
                <Input value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} placeholder="Search for items, brands, or prices..." className="bg-input text-foreground"/>
              </CardContent>
            </Card>

            {isSearching && <Loader />}
            
            {searchResults.length > 0 && (
              <Card className="bg-card text-card-foreground">
                <CardHeader><CardTitle>🔍 Search Results</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {searchResults.map((item, i) => (
                      <li key={i} className="flex justify-between items-center border border-border p-2 rounded hover:bg-secondary">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.brand} - ₹{item.price}</p>
                        </div>
                        <Button size="sm" onClick={() => addItem(item.name)} className="bg-primary text-primary-foreground hover:bg-primary/90">Add</Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {smartSuggestions.length > 0 && !isSearching && searchResults.length === 0 && (
              <Card className="bg-card text-card-foreground">
                <CardHeader><CardTitle>🧠 Smart Suggestions</CardTitle></CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {smartSuggestions.map((s, i) => (<li key={i}>{s}</li>))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Shopping List ({items.length})</span>
                {items.length > 0 && <Button variant="outline" size="sm" onClick={clearList} className="border-border text-muted-foreground hover:bg-secondary">Clear All</Button>}
              </CardTitle>
              {items.length > 0 && (
                <CardDescription className="font-bold text-lg text-primary">
                  Total Cost: ₹{totalCost.toFixed(2)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted" />
                  <p className="mt-2">Your shopping list is empty.</p>
                  <p className="text-sm">Use your voice or search to add items.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedItems).map(([cat, catItems]) => (
                    <div key={cat}>
                      <h3 className="font-semibold text-lg capitalize mb-2">{cat} <Badge className="bg-primary text-primary-foreground">{catItems.length}</Badge></h3>
                      <div className="space-y-2">
                        {catItems.map((item) => (
                          <div key={item.id}
                            className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                              item.completed ? "bg-secondary" : "bg-muted"
                            }`}>
                            <div className="flex gap-3 items-center">
                              <input type="checkbox" checked={item.completed} onChange={() => toggleItem(item.id)} className="h-5 w-5"/>
                              <div className="flex flex-col">
                                <span className={`${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {item.name}
                                </span>
                                {/* **NEW:** Display individual item price */}
                                <span className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} each</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-secondary" onClick={() => decreaseQuantity(item.id)}><Minus className="h-4 w-4"/></Button>
                              <span className="font-bold text-foreground">{item.quantity}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-secondary" onClick={() => increaseQuantity(item.id)}><Plus className="h-4 w-4"/></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-900/20" onClick={() => removeItemByName(item.name)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4 bg-border" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}