/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <ignore> */
import { Howl, Howler } from "howler";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarVisualizer, useAudioVolume } from "../ui/bar-visualizer";
import { Matrix } from "../ui/matrix";
import { HudDialog } from "./hud-dialog";

interface Quote {
  name: string;
  sound: string;
  text: string;
}

const quotes: Quote[] = [
  {
    name: "Cooper",
    sound: "cooper.mp3",
    text: "We used to look up at the sky and wonder at our place in the stars. Now we just look down, and worry about our place in the dirt.",
  },
  {
    name: "TARS",
    sound: "tars.mp3",
    text: "Absolute honesty isn't always the most diplomatic nor the safest form of communication with emotional beings.",
  },
  {
    name: "Brand",
    sound: "brand.mp3",
    text: "Love is the one thing we're capable of perceiving that transcends dimensions of time and space.",
  },
  {
    name: "Dr. Brand",
    sound: "drbrand.mp3",
    text: "Do not go gentle into that good night; Old age should burn and rave at close of day. Rage, rage against the dying of the light.",
  },
];

export const HudCommsPanel = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const isMobile = useIsMobile();
  const volume = useAudioVolume(mediaStream);
  const meterCols = isMobile ? 8 : 12;
  const frequencyData = useMemo(
    () => new Array(meterCols).fill(0).map(() => volume * 255),
    [meterCols, volume]
  );
  const levels = useMemo(
    () => frequencyData.map((freq) => freq / 255),
    [frequencyData]
  );
  const howlRef = useRef<Howl | null>(null);
  const streamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(
    null
  );
  const isConnectedRef = useRef(false);
  const autoplayEnabledRef = useRef(true);
  const initCompleteRef = useRef(false);
  const trackIndexRef = useRef(0);
  const initTimerRef = useRef<number | null>(null);
  const playedAllRef = useRef(false);
  const nextTrackTimerRef = useRef<number | null>(null);

  const ensureAudioGraph = () => {
    if (!Howler.ctx || streamDestinationRef.current) {
      return;
    }

    streamDestinationRef.current = Howler.ctx.createMediaStreamDestination();
    setMediaStream(streamDestinationRef.current.stream);

    if (!isConnectedRef.current) {
      Howler.masterGain?.connect(streamDestinationRef.current);
      isConnectedRef.current = true;
    }
  };

  const stopPlayback = () => {
    autoplayEnabledRef.current = false;
    howlRef.current?.stop();
  };

  const playQuote = useCallback((index: number) => {
    howlRef.current?.unload();

    const quote = quotes[index] ?? quotes[0];
    const track = `/sounds/${quote.sound}`;
    const howl = new Howl({
      src: [track],
      loop: false,
      volume: 0.3,
      onend: () => {
        if (!autoplayEnabledRef.current) {
          return;
        }
        const nextIndex = index + 1;
        if (nextIndex < quotes.length) {
          trackIndexRef.current = nextIndex;
          if (nextTrackTimerRef.current) {
            window.clearTimeout(nextTrackTimerRef.current);
          }
          nextTrackTimerRef.current = window.setTimeout(() => {
            playQuote(nextIndex);
          }, 2000);
          return;
        }
        autoplayEnabledRef.current = false;
        playedAllRef.current = true;
      },
    });

    howlRef.current = howl;
    setQuoteIndex(index);
    howl.play();
  }, []);

  const startAutoplay = () => {
    if (playedAllRef.current) {
      return;
    }
    autoplayEnabledRef.current = true;
    trackIndexRef.current = 0;
    playQuote(trackIndexRef.current);
    ensureAudioGraph();

    if (Howler.ctx?.state === "suspended") {
      Howler.ctx.resume().catch(() => {
        return null;
      });
    }
  };

  useEffect(() => {
    initTimerRef.current = window.setTimeout(() => {
      initCompleteRef.current = true;
      if (!isOpen) {
        startAutoplay();
      }
    }, 2500);

    return () => {
      if (initTimerRef.current) {
        window.clearTimeout(initTimerRef.current);
      }
      if (nextTrackTimerRef.current) {
        window.clearTimeout(nextTrackTimerRef.current);
      }
      stopPlayback();
      howlRef.current?.unload();
      howlRef.current = null;
      streamDestinationRef.current = null;
      isConnectedRef.current = false;
      playedAllRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (initCompleteRef.current) {
        startAutoplay();
      }
      return;
    }

    stopPlayback();
  }, [isOpen]);

  return (
    <>
      <div
        className="flex w-full items-center justify-end"
        data-slot="hud-comms-panel"
      >
        <button
          className="group relative flex w-full flex-col gap-3 px-2 py-2 text-left"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-l from-cyan-400/60 via-white/10 to-transparent" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] text-white/50 uppercase tracking-[0.35em]">
              Comms
            </span>
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
              Channel
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr,120px] sm:items-center">
            <div className="space-y-2">
              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1 font-mono text-[9px] text-white/60"
                  exit={{ opacity: 0, y: -6 }}
                  initial={{ opacity: 0, y: 6 }}
                  key={quoteIndex}
                >
                  <div className="text-white/40 uppercase tracking-widest">
                    {quotes[quoteIndex]?.name}
                  </div>
                  {!isMobile && (
                    <div className="text-white/70 italic">
                      "{quotes[quoteIndex]?.text}"
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between gap-2">
              {!isMobile && (
                <BarVisualizer
                  barCount={15}
                  className="h-12 w-28 rounded-none bg-transparent p-0"
                  maxHeight={80}
                  mediaStream={mediaStream}
                  minHeight={15}
                  state={isConnectedRef.current ? "connecting" : "speaking"}
                />
              )}
              <Matrix
                ariaLabel="Audio frequency meter"
                cols={meterCols}
                gap={1}
                levels={levels}
                mode="vu"
                rows={isMobile ? 5 : 6}
                size={isMobile ? 6 : 8}
              />
            </div>
          </div>
        </button>
      </div>
      <HudDialog
        description="COMMUNICATIONS_ARRAY"
        onOpenChange={setIsOpen}
        open={isOpen}
        title="COMMS_CHANNEL"
      >
        {/** TODO: Will implement agent later, don't make changes here */}
        <div className="space-y-4">
          <div className="border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between font-mono text-[10px] text-white uppercase tracking-widest">
              <span>TARS VOICE AGENT</span>
              <span className="text-white/30">STANDBY</span>
            </div>
            <p className="mt-2 font-mono text-[9px] text-white/40">
              Voice interface pending. Awaiting signal handshake.
            </p>
            <div className="mt-3 inline-flex border border-white/10 bg-white/5 px-2 py-1 font-mono text-[9px] text-white/50 uppercase">
              Initialize (Coming Soon)
            </div>
          </div>
        </div>
      </HudDialog>
    </>
  );
});
