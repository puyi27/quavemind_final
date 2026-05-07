export default function RouteLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="relative">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#2d2d2d] border-t-[#ff6b00]" />
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[#ff6b00]/15 blur-xl" />
      </div>
    </div>
  );
}

