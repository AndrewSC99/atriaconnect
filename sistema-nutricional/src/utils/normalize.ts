/**
 * Utility functions for text normalization and accent-insensitive search
 */

/**
 * Normalizes text by removing accents, special characters, and converting to lowercase
 * @param text - Text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose combined characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks (accents)
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim()
}

/**
 * Checks if a text contains a search term (accent-insensitive)
 * @param text - Text to search in
 * @param searchTerm - Term to search for
 * @returns True if text contains the search term
 */
export function containsText(text: string, searchTerm: string): boolean {
  if (!text || !searchTerm) return false
  
  const normalizedText = normalizeText(text)
  const normalizedSearchTerm = normalizeText(searchTerm)
  
  return normalizedText.includes(normalizedSearchTerm)
}

/**
 * Checks if text starts with a search term (accent-insensitive)
 * @param text - Text to check
 * @param searchTerm - Term to check for
 * @returns True if text starts with the search term
 */
export function startsWithText(text: string, searchTerm: string): boolean {
  if (!text || !searchTerm) return false
  
  const normalizedText = normalizeText(text)
  const normalizedSearchTerm = normalizeText(searchTerm)
  
  return normalizedText.startsWith(normalizedSearchTerm)
}

/**
 * Calculates similarity score between two texts (0-1, where 1 is identical)
 * @param text1 - First text
 * @param text2 - Second text
 * @returns Similarity score
 */
export function calculateSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0
  
  const normalized1 = normalizeText(text1)
  const normalized2 = normalizeText(text2)
  
  if (normalized1 === normalized2) return 1
  
  // Simple substring-based similarity
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    const shorter = normalized1.length < normalized2.length ? normalized1 : normalized2
    const longer = normalized1.length >= normalized2.length ? normalized1 : normalized2
    return shorter.length / longer.length
  }
  
  // Word-based similarity for partial matches
  const words1 = normalized1.split(' ').filter(w => w.length > 0)
  const words2 = normalized2.split(' ').filter(w => w.length > 0)
  
  let commonWords = 0
  words1.forEach(word1 => {
    if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      commonWords++
    }
  })
  
  const totalWords = Math.max(words1.length, words2.length)
  return totalWords > 0 ? commonWords / totalWords : 0
}

/**
 * Sorts array of objects by relevance to search term
 * @param items - Array of objects to sort
 * @param searchTerm - Search term for relevance
 * @param textField - Field name containing the text to match
 * @returns Sorted array with most relevant items first
 */
export function sortByRelevance<T extends Record<string, any>>(
  items: T[], 
  searchTerm: string, 
  textField: keyof T
): T[] {
  if (!searchTerm) return items
  
  return items
    .map(item => ({
      item,
      similarity: calculateSimilarity(item[textField], searchTerm),
      startsWithMatch: startsWithText(item[textField], searchTerm),
      containsMatch: containsText(item[textField], searchTerm)
    }))
    .sort((a, b) => {
      // Prioritize exact starts-with matches
      if (a.startsWithMatch && !b.startsWithMatch) return -1
      if (b.startsWithMatch && !a.startsWithMatch) return 1
      
      // Then by similarity score
      if (a.similarity !== b.similarity) return b.similarity - a.similarity
      
      // Finally by contains match
      if (a.containsMatch && !b.containsMatch) return -1
      if (b.containsMatch && !a.containsMatch) return 1
      
      return 0
    })
    .map(result => result.item)
}