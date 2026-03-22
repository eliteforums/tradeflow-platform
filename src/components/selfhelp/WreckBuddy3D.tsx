export default function WreckBuddy3D() {
  return (
    <div className="w-full h-full min-h-[60vh] rounded-2xl overflow-hidden border border-border/50">
      <iframe
        src="/games/ragdoll-bash.html"
        title="Wreck the Buddy – Ragdoll Bash"
        className="w-full h-full border-0"
        style={{ minHeight: "60vh" }}
        allow="autoplay"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
