interface Props {
  header: React.ReactNode;
  filters: React.ReactNode;
  main: React.ReactNode;
  rail: React.ReactNode;
}

export function DashboardShell({ header, filters, main, rail }: Props) {
  return (
    <div className="app">
      {header}
      {filters}
      <div className="body">
        <main className="main">{main}</main>
        <aside className="rail">{rail}</aside>
      </div>
    </div>
  );
}
