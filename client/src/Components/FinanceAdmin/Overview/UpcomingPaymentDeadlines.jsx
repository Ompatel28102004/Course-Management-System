'use client'

import React, { useState, useReducer, useEffect } from 'react'
import { Plus, X, Edit2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const initialState = {
  notes: [],
  nextId: 1,
}

function notesReducer(state, action) {
  switch (action.type) {
    case 'ADD_NOTE':
      return {
        ...state,
        notes: [...state.notes, { ...action.payload, id: state.nextId }],
        nextId: state.nextId + 1,
      }
    case 'EDIT_NOTE':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id ? action.payload : note
        ),
      }
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
      }
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.payload.notes,
        nextId: action.payload.nextId,
      }
    default:
      return state
  }
}

export default function UpcomingPaymentDeadlines() {
  const [state, dispatch] = useReducer(notesReducer, initialState)
  const [filter, setFilter] = useState({ degree: 'all', course: 'all' })
  const [editingNote, setEditingNote] = useState(null)

  // Load notes from localStorage when the component mounts
  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem('notes'))
    const nextId = JSON.parse(localStorage.getItem('nextId')) || 1
    if (storedNotes) {
      dispatch({ type: 'SET_NOTES', payload: { notes: storedNotes, nextId } })
    }
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(state.notes))
    localStorage.setItem('nextId', JSON.stringify(state.nextId))
  }, [state.notes, state.nextId])

  const addNote = (note) => {
    dispatch({ type: 'ADD_NOTE', payload: note })
  }

  const editNote = (note) => {
    dispatch({ type: 'EDIT_NOTE', payload: note })
    setEditingNote(null)
  }

  const deleteNote = (id) => {
    dispatch({ type: 'DELETE_NOTE', payload: id })
  }

  const filteredNotes = state.notes.filter(
    (note) =>
      (filter.degree === 'all' || note.degree === filter.degree) &&
      (filter.course === 'all' || note.course === filter.course)
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Deadlines Tracker</h1>
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={(value) => setFilter({ ...filter, degree: value })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Degree" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Degrees</SelectItem>
            <SelectItem value="btech">B.Tech</SelectItem>
            <SelectItem value="mtech">M.Tech</SelectItem>
            <SelectItem value="phd">PhD</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setFilter({ ...filter, course: value })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="cs">Computer Science</SelectItem>
            <SelectItem value="civil">Civil Engineering</SelectItem>
            <SelectItem value="mech">Mechanical Engineering</SelectItem>
            <SelectItem value="electrical">Electrical Engineering</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-card text-card-foreground p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{note.title}</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => setEditingNote(note)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteNote(note.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Due: {note.dueDate}</p>
            <p className="text-sm mb-2">{note.description}</p>
            <div className="flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(note.category)}`}>
                {note.category}
              </span>
              <div className="text-xs text-muted-foreground">
                {note.degree} - {note.course}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="fixed bottom-4 right-4 bg-custom-selectedPurple hover:bg-cutom-hoverSelectedPurple">
            <Plus className="mr-2 h-4 w-4" /> Add Note
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
          </DialogHeader>
          <NoteForm onSubmit={editingNote ? editNote : addNote} initialData={editingNote} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NoteForm({ onSubmit, initialData }) {
  const [note, setNote] = useState(
    initialData || {
      title: '',
      dueDate: '',
      description: '',
      category: 'normal',
      degree: '',
      course: '',
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(note)
    setNote({
      title: '',
      dueDate: '',
      description: '',
      category: 'normal',
      degree: '',
      course: '',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={note.dueDate}
          onChange={(e) => setNote({ ...note, dueDate: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={note.description}
          onChange={(e) => setNote({ ...note, description: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={note.category} onValueChange={(value) => setNote({ ...note, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="degree">Degree</Label>
        <Select value={note.degree} onValueChange={(value) => setNote({ ...note, degree: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a degree" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="btech">B.Tech</SelectItem>
            <SelectItem value="mtech">M.Tech</SelectItem>
            <SelectItem value="phd">PhD</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="course">Course</Label>
        <Select value={note.course} onValueChange={(value) => setNote({ ...note, course: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cs">Computer Science</SelectItem>
            <SelectItem value="civil">Civil Engineering</SelectItem>
            <SelectItem value="mech">Mechanical Engineering</SelectItem>
            <SelectItem value="electrical">Electrical Engineering</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="bg-custom-selectedPurple hover:bg-cutom-hoverSelectedPurple" type="submit">
        {initialData ? 'Update Note' : 'Add Note'}
      </Button>
    </form>
  )
}

function getCategoryColor(category) {
  switch (category) {
    case 'urgent':
      return 'bg-red-100 text-red-800'
    case 'follow-up':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-green-100 text-green-800'
  }
}