import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Eye, EyeOff, Shuffle, Users, Undo2, Play, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AppImpostores() {
  const [phase, setPhase] = useState("setup");
  const [names, setNames] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const [fixedName, setFixedName] = useState(null);
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);

  const playerCount = names.length;
  const MIN_PLAYERS = 3;
  const IMPOSTORS = 2;

  const canStart = playerCount >= MIN_PLAYERS && playerCount >= IMPOSTORS + 1;

  function addName() {
    const n = input.trim();
    if (!n) return;
    if (n.length > 40) {
      setError("El nombre es muy largo (máx. 40).");
      return;
    }
    setNames((prev) => [...prev, n]);
    setInput("");
    setError("");
  }

  function undoLast() {
    setNames((prev) => prev.slice(0, -1));
  }

  function resetAll() {
    setPhase("setup");
    setNames([]);
    setInput("");
    setError("");
    setFixedName(null);
    setDeck([]);
    setIndex(0);
    setShown(false);
  }

  function startGame() {
    if (!canStart) {
      setError(`Necesitan al menos ${MIN_PLAYERS} jugadores y mínimo ${IMPOSTORS + 1} nombres para tener cartas no impostoras.`);
      return;
    }
    const chosen = names[Math.floor(Math.random() * names.length)];
    setFixedName(chosen);

    const total = names.length;
    const impostorCards = Array.from({ length: IMPOSTORS }, (_, i) => ({ id: `I${i}`, type: "impostor", label: "IMPOSTOR" }));
    const nameCards = Array.from({ length: total - IMPOSTORS }, (_, i) => ({ id: `N${i}`, type: "name", label: chosen }));

    const shuffled = shuffleArray([...impostorCards, ...nameCards]);
    setDeck(shuffled);
    setIndex(0);
    setShown(false);
    setPhase("reveal");
  }

  function toggleCard() {
    if (!shown) {
      setShown(true);
    } else {
      const next = index + 1;
      if (next >= deck.length) {
        setShown(false);
        setPhase("end");
      } else {
        setIndex(next);
        setShown(false);
      }
    }
  }

  const progressText = useMemo(() => {
    if (phase !== "reveal") return "";
    return `Carta ${index + 1} de ${deck.length}`;
  }, [phase, index, deck.length]);

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">El inspector</h1>
              <Button variant="ghost" size="icon" onClick={resetAll} aria-label="Reiniciar">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-neutral-500">Pasa el teléfono, cada jugador escribe un nombre en secreto.</p>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            {phase === "setup" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Escribe un nombre y toca Agregar"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addName();
                    }}
                  />
                  <Button onClick={addName} className="shrink-0">Agregar</Button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      Jugadores: <strong>{playerCount}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 opacity-70">
                    <Shuffle className="h-4 w-4" />
                    <span>Impostores: {IMPOSTORS}</span>
                  </div>
                </div>

                {names.length > 0 && (
                  <div className="text-xs text-neutral-500">
                    La lista está oculta. Puedes <button onClick={undoLast} className="underline inline-flex items-center gap-1">deshacer último<Undo2 className="h-3 w-3"/></button> o seguir agregando.
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={startGame}
                  disabled={!canStart}
                  className="w-full h-12 text-base"
                >
                  <Play className="h-5 w-5 mr-2" /> Comenzar juego
                </Button>

                {!canStart && (
                  <p className="text-xs text-neutral-500">
                    Necesitan al menos {MIN_PLAYERS} jugadores. Se reparten {IMPOSTORS} cartas de "IMPOSTOR" y el resto será un mismo nombre elegido al azar de la lista.
                  </p>
                )}
              </div>
            )}

            {phase === "reveal" && (
              <div className="space-y-4">
                <p className="text-sm text-neutral-600">Entrega el teléfono al próximo jugador. Toca la carta para ver tu rol y vuelve a tocar para ocultarla y pasar al siguiente.</p>
                <div className="text-right text-xs text-neutral-500">{progressText}</div>

                <AnimatePresence mode="wait">
                  <motion.button
                    key={`${index}-${shown}`}
                    onClick={toggleCard}
                    className="w-full aspect-[3/4] rounded-3xl border bg-white shadow-lg overflow-hidden focus:outline-none active:scale-[0.99]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {shown ? (
                        <div className="flex flex-col items-center gap-3">
                          {deck[index]?.type === "impostor" ? (
                            <span className="text-4xl font-black tracking-wide">IMPOSTOR</span>
                          ) : (
                            <>
                              <span className="text-sm uppercase tracking-wider text-neutral-500">Tu palabra es</span>
                              <span className="text-4xl font-black tracking-wide text-center px-4">{deck[index]?.label}</span>
                            </>
                          )}
                          <span className="text-xs text-neutral-400 flex items-center gap-1"><EyeOff className="h-3 w-3"/>Toca para ocultar</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-neutral-500">
                          <Eye className="h-8 w-8"/>
                          <span className="text-sm">Toca para ver tu carta</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                </AnimatePresence>

                <div className="text-center text-xs text-neutral-400">No muestres tu carta a nadie.</div>
              </div>
            )}

            {phase === "end" && (
              <div className="space-y-5 text-center">
                <div className="text-sm text-neutral-600">
                  ¡Todas las cartas se repartieron!
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Button onClick={() => startGame()} variant="secondary">Repartir NUEVAMENTE (mismo grupo)</Button>
                  <Button onClick={resetAll}>Nueva partida (nuevos nombres)</Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
}
