import React, { createContext, useContext, useState, useEffect } from 'react'

const CompareContext = createContext()

export const useCompare = () => {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider')
  }
  return context
}

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState(() => {
    const saved = localStorage.getItem('compareItems')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(compareItems))
  }, [compareItems])

  const addToCompare = (product) => {
    if (compareItems.length >= 4) {
      return { success: false, message: 'You can compare up to 4 products only' }
    }
    if (compareItems.find(item => item.id === product.id)) {
      return { success: false, message: 'Product already in comparison' }
    }
    setCompareItems(prev => [...prev, product])
    return { success: true, message: 'Added to comparison' }
  }

  const removeFromCompare = (productId) => {
    setCompareItems(prev => prev.filter(item => item.id !== productId))
  }

  const clearCompare = () => {
    setCompareItems([])
  }

  const isInCompare = (productId) => {
    return compareItems.some(item => item.id === productId)
  }

  return (
    <CompareContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      compareCount: compareItems.length
    }}>
      {children}
    </CompareContext.Provider>
  )
}
