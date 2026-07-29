type WaveDividerProps = {
  className?: string;
};

export function WaveDivider({ className = "" }: WaveDividerProps) {
  return (
    <div className={`w-full overflow-hidden leading-none ${className}`}>
      <svg
        aria-hidden
        className="h-12 w-full md:h-24"
        preserveAspectRatio="none"
        viewBox="0 0 1200 120"
      >
        <path d="M0,22C77,6,154,5,232,16c84,12,162,39,245,59c79,19,163,31,246,25c73-6,143-24,214-37c86-16,174-17,263,10V0H0V22Z" />
      </svg>
    </div>
  );
}
