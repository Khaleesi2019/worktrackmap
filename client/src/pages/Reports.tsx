import { useLanguage } from "@/context/LanguageContext";

export default function Reports() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">{t('reports')}</h1>
        <p className="text-muted-foreground">
          View and export employee reports
        </p>
      </div>

      <div className="grid place-items-center h-64">
        <div className="text-center">
          <i className="fas fa-chart-bar text-5xl text-muted-foreground mb-4"></i>
          <p className="text-lg">Reports functionality coming soon</p>
        </div>
      </div>
    </div>
  );
}
