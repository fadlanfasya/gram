"use client"

import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Controls,
  Background,
  Handle,
  Position,
  NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import dagre from 'dagre'
import { Maximize2, Loader2, Network } from 'lucide-react'

// --- Custom Node Component ---
const CustomNode = ({ data }: NodeProps) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-lg border-2 min-w-[150px] text-center transition-all
      ${data.isCenter 
        ? 'bg-blue-50 border-blue-500' 
        : 'bg-white border-gray-200 hover:border-blue-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="font-bold text-gray-900 text-sm">{data.label}</div>
      <div className="text-xs text-gray-500 mt-1">{data.type}</div>
      
      {!data.isCenter && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-center">
           <span className="text-[10px] text-blue-600 flex items-center gap-1">
             <Maximize2 className="h-3 w-3" /> Click to Expand
           </span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

// --- Layout Helper ---
const getLayoutedElements = (nodes: Node[], edges: Edge[], centerId: string | null) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const nodeWidth = 200
  const nodeHeight = 100

  dagreGraph.setGraph({ rankdir: 'TB' }) // Top to Bottom layout

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

// --- Main Explorer Component ---
interface CIExplorerProps {
  initialAssetId: string | null
}

export default function CIExplorer({ initialAssetId }: CIExplorerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(false)
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set())

  const fetchAssetNeighbors = async (assetId: string, isInitial = false) => {
    if (processedIds.has(assetId) && !isInitial) return
    setLoading(true)

    try {
      const res = await fetch(`/api/assets/${assetId}/graph`)
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      // Merge new nodes/edges with existing ones
      setNodes((nds) => {
        const existingIds = new Set(nds.map(n => n.id))
        const newNodes = data.nodes.filter((n: Node) => !existingIds.has(n.id))
        
        // Mark the expanded node as a "center" visually if desired, 
        // or just keep it processed.
        return [...nds, ...newNodes]
      })

      setEdges((eds) => {
        const existingIds = new Set(eds.map(e => e.id))
        const newEdges = data.edges.filter((e: Edge) => !existingIds.has(e.id))
        return [...eds, ...newEdges]
      })

      setProcessedIds(prev => new Set(prev).add(assetId))

    } catch (error) {
      console.error("Failed to expand graph", error)
    } finally {
      setLoading(false)
    }
  }

  // Initial Load
  useEffect(() => {
    if (initialAssetId) {
      fetchAssetNeighbors(initialAssetId, true)
    }
  }, [initialAssetId])

  // Auto Layout when nodes/edges count changes
  useEffect(() => {
    if (nodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        initialAssetId
      )
      setNodes([...layoutedNodes])
      setEdges([...layoutedEdges])
    }
  }, [nodes.length, edges.length])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    fetchAssetNeighbors(node.id)
  }, [processedIds])

  if (!initialAssetId) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">
          <Network className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No asset selected for visualization</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[700px] border border-gray-200 rounded-lg bg-gray-50 relative">
      {loading && (
        <div className="absolute top-4 right-4 z-10 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating Graph...
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  )
}