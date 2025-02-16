import { NextResponse } from "next/server"

interface Book {
  id: string
  title: string
  author: string
}

const books: Book[] = [
  { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { id: "2", title: "To Kill a Mockingbird", author: "Harper Lee" },
]

export async function GET() {
  return NextResponse.json(books)
}

export async function POST(request: Request) {
  const book: Omit<Book, "id"> = await request.json()
  const newBook = { ...book, id: Date.now().toString() }
  books.push(newBook)
  return NextResponse.json(newBook, { status: 201 })
}

export async function PUT(request: Request) {
  const updatedBook: Book = await request.json()
  const index = books.findIndex((book) => book.id === updatedBook.id)
  if (index !== -1) {
    books[index] = updatedBook
    return NextResponse.json(updatedBook)
  }
  return NextResponse.json({ error: "Book not found" }, { status: 404 })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  const index = books.findIndex((book) => book.id === id)
  if (index !== -1) {
    books.splice(index, 1)
    return NextResponse.json({ message: "Book deleted successfully" })
  }
  return NextResponse.json({ error: "Book not found" }, { status: 404 })
}

