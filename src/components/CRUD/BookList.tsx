"use client"

import { Button } from "@/components/ui/button"

interface Book {
  id: string
  title: string
  author: string
}

interface BookListProps {
  books: Book[]
  onEdit: (book: Book) => void
  onDelete: (id: string) => void
}

export function BookList({ books, onEdit, onDelete }: BookListProps) {
  return (
    <ul className="space-y-2">
      {books.map((book) => (
        <li key={book.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
          <span>
            {book.title} by {book.author}
          </span>
          <div>
            <Button variant="outline" className="mr-2" onClick={() => onEdit(book)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => onDelete(book.id)}>
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}