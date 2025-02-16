"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { BookForm } from "./BookForm"
import { BookList } from "./BookList"

interface Book {
  id: string
  title: string
  author: string
}

async function fetchBooks(): Promise<Book[]> {
  const response = await fetch("/api/books")
  if (!response.ok) throw new Error("Failed to fetch books")
  return response.json()
}

async function addBook(book: Omit<Book, "id">): Promise<Book> {
  const response = await fetch("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  })
  if (!response.ok) throw new Error("Failed to add book")
  return response.json()
}

async function updateBook(book: Book): Promise<Book> {
  const response = await fetch("/api/books", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  })
  if (!response.ok) throw new Error("Failed to update book")
  return response.json()
}

async function deleteBook(id: string): Promise<void> {
  const response = await fetch("/api/books", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
  if (!response.ok) throw new Error("Failed to delete book")
}

export function BookManager() {
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: books, isLoading, error } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: fetchBooks,
  })

  const addBookMutation = useMutation({
    mutationFn: addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] })
      toast({ title: "Success", description: "Book added successfully" })
      setEditingBook(null)
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const updateBookMutation = useMutation({
    mutationFn: updateBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] })
      toast({ title: "Success", description: "Book updated successfully" })
      setEditingBook(null)
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const deleteBookMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] })
      toast({ title: "Success", description: "Book deleted successfully" })
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  function handleFormSubmit(values: { title: string; author: string }) {
    if (editingBook) {
      updateBookMutation.mutate({ ...values, id: editingBook.id })
    } else {
      addBookMutation.mutate(values)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>An error occurred: {error.message}</div>

  return (
    <div className="space-y-8">
      <BookForm
        onSubmit={handleFormSubmit}
        defaultValues={editingBook ? { title: editingBook.title, author: editingBook.author } : undefined}
        isSubmitting={addBookMutation.isPending || updateBookMutation.isPending}
        onCancel={() => setEditingBook(null)}
      />
      <BookList books={books || []} onEdit={setEditingBook} onDelete={deleteBookMutation.mutate} />
    </div>
  )
}
