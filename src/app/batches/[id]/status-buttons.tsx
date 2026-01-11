'use client'

import { updateBatchStatus } from './actions'
import { useTransition } from 'react'

export default function StatusButtons({ batchId, status }: { batchId: string, status: string }) {
  const [isPending, startTransition] = useTransition()

  const handleUpdate = (newStatus: 'planned' | 'in_progress' | 'completed') => {
    startTransition(async () => {
      await updateBatchStatus(batchId, newStatus)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'planned' && (
        <button 
          onClick={() => handleUpdate('in_progress')}
          disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Starting...' : 'Start Production'}
        </button>
      )}

      {status === 'in_progress' && (
        <button 
          onClick={() => handleUpdate('completed')}
          disabled={isPending}
          className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {isPending ? 'Finishing...' : 'Mark Completed'}
        </button>
      )}
      
      {status === 'completed' && (
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-md font-bold border border-green-200">
          Batch Completed
        </span>
      )}
    </div>
  )
}