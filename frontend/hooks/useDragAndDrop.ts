'use client'

import { useState, useCallback, useRef } from 'react'

interface DragState {
  isDragging: boolean
  draggedItem: any
  dragOverItem: any
  dropZone: string | null
}

interface UseDragAndDropOptions {
  onDrop?: (draggedItem: any, dropZone: string, dropIndex?: number) => void
  onDragStart?: (item: any) => void
  onDragEnd?: () => void
}

export function useDragAndDrop(options: UseDragAndDropOptions = {}) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragOverItem: null,
    dropZone: null
  })

  const dragCounter = useRef(0)

  const handleDragStart = useCallback((item: any) => {
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedItem: item
    }))
    options.onDragStart?.(item)
  }, [options])

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOverItem: null,
      dropZone: null
    })
    dragCounter.current = 0
    options.onDragEnd?.()
  }, [options])

  const handleDragEnter = useCallback((e: React.DragEvent, dropZone: string) => {
    e.preventDefault()
    dragCounter.current++
    setDragState(prev => ({
      ...prev,
      dropZone
    }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragState(prev => ({
        ...prev,
        dropZone: null
      }))
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropZone: string, dropIndex?: number) => {
    e.preventDefault()
    dragCounter.current = 0
    
    if (dragState.draggedItem) {
      options.onDrop?.(dragState.draggedItem, dropZone, dropIndex)
    }
    
    handleDragEnd()
  }, [dragState.draggedItem, options, handleDragEnd])

  const getDragProps = useCallback((item: any) => ({
    draggable: true,
    onDragStart: () => handleDragStart(item),
    onDragEnd: handleDragEnd,
    className: dragState.draggedItem === item ? 'opacity-50 scale-95' : ''
  }), [dragState.draggedItem, handleDragStart, handleDragEnd])

  const getDropProps = useCallback((dropZone: string) => ({
    onDragEnter: (e: React.DragEvent) => handleDragEnter(e, dropZone),
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: (e: React.DragEvent, dropIndex?: number) => handleDrop(e, dropZone, dropIndex),
    className: dragState.dropZone === dropZone ? 'bg-blue-50 border-blue-300 border-dashed' : ''
  }), [dragState.dropZone, handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  return {
    dragState,
    getDragProps,
    getDropProps,
    isDragging: dragState.isDragging,
    draggedItem: dragState.draggedItem,
    dropZone: dragState.dropZone
  }
}