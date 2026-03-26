interface EmptyStateProps {
  message: string
}

export default function EmptyState({ message }: EmptyStateProps) {
  return <li className="py-8 text-center text-gray-500 list-none">{message}</li>
}
