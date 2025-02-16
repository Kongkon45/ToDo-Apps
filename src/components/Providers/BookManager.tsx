"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface Book {
  id: string
  title: string
  author: string
}

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
})


async function fetchBooks(): Promise<Book[]> {
  const response = await fetch("/api/books")
  if (!response.ok) {
    throw new Error("Failed to fetch books")
  }
  return response.json()
}

async function addBook(book: Omit<Book, "id">): Promise<Book> {
  const response = await fetch("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  })
  if (!response.ok) {
    throw new Error("Failed to add book")
  }
  return response.json()
}

async function updateBook(book: Book): Promise<Book> {
  const response = await fetch("/api/books", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  })
  if (!response.ok) {
    throw new Error("Failed to update book")
  }
  return response.json()
}

async function deleteBook(id: string): Promise<void> {
  const response = await fetch("/api/books", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
  if (!response.ok) {
    throw new Error("Failed to delete book")
  }
}

export function BookManager() {
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: books,
    isLoading,
    error,
  } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: fetchBooks,
  })

  const addBookMutation = useMutation({
    mutationFn: addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] })
      toast({ title: "Success", description: "Book added successfully" })
      form.reset()
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
      form.reset()
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

  const form = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
    },
  })

  function onSubmit(values: z.infer<typeof bookSchema>) {
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={addBookMutation.isPending || updateBookMutation.isPending}>
            {editingBook ? "Update Book" : "Add Book"}
          </Button>
          {editingBook && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingBook(null)
                form.reset()
              }}
            >
              Cancel Edit
            </Button>
          )}
        </form>
      </Form>

      <ul className="space-y-2">
        {books?.map((book) => (
          <li key={book.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <span>
              {book.title} by {book.author}
            </span>
            <div>
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => {
                  setEditingBook(book)
                  form.reset(book)
                }}
              >
                Edit
              </Button>
              <Button variant="destructive" onClick={() => deleteBookMutation.mutate(book.id)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

