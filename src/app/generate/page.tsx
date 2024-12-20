'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Recipe {
  title: string
  ingredients: string[]
  instructions: string[]
}

export default function GenerateRecipe() {
  const [ingredients, setIngredients] = useState('')
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveMessage(null)

    if (!ingredients.trim()) {
      setSaveMessage('Please enter some ingredients to generate a recipe.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      })
      if (!response.ok) {
        throw new Error('Failed to generate recipe.')
      }
      const data = await response.json()
      setGeneratedRecipe(data)
    } catch (error) {
      console.error('Error generating recipe:', error)
      setSaveMessage('An error occurred while generating the recipe.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/save-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedRecipe),
      })
      if (response.ok) {
        setSaveMessage('Recipe saved successfully!')
      } else {
        setSaveMessage('Failed to save recipe. Please try again.')
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
      setSaveMessage('An error occurred while saving the recipe.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Generate a Recipe</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <label htmlFor="ingredients" className="block mb-2">
          Enter ingredients (comma-separated):
        </label>
        <textarea
          id="ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={4}
        />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Recipe'}
        </button>
      </form>
      {isLoading && (
        <div className="flex justify-center items-center mb-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {generatedRecipe && (
        <div className="bg-white shadow-md rounded-md p-6">
          <h2 className="text-2xl font-semibold mb-4">{generatedRecipe.title}</h2>
          <h3 className="text-lg font-medium mb-2">Ingredients:</h3>
          <ul className="list-disc list-inside mb-4">
            {generatedRecipe?.ingredients?.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
          <h3 className="text-lg font-medium mb-2">Instructions:</h3>
          <div className="prose">
            <ReactMarkdown>{generatedRecipe?.instructions.join('\n')}</ReactMarkdown>
          </div>
          <button
            onClick={handleSaveRecipe}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Recipe'}
          </button>
          {saveMessage && (
            <p className={`mt-4 ${saveMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
              {saveMessage}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
