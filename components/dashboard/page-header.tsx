interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-medium">{title}</h1>
      {description && (
        <p className="text-text-secondary mt-1">{description}</p>
      )}
    </div>
  );
}
