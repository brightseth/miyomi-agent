import { NextRequest, NextResponse } from 'next/server';

// Central Agent Registry API endpoint
const AGENT_REGISTRY_API = process.env.AGENT_REGISTRY_API || 'https://api.eden.art/agents/registry';
const MIYOMI_AGENT_ID = 'miyomi';

interface MediaItem {
  id: string;
  agentId: string;
  type: string;
  url: string;
  title?: string;
  marketTitle?: string;
  position?: string;
  price?: number;
  pnl?: number;
  uploadedAt: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    // Fetch Miyomi's content from the central agent registry
    const response = await fetch(`${AGENT_REGISTRY_API}/content?agentId=${MIYOMI_AGENT_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_API_KEY || ''}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        media: data.content || []
      });
    }
    
    // Fallback to empty array if API is not available
    return NextResponse.json({
      success: true,
      media: []
    });
  } catch (error) {
    console.error('Failed to fetch from agent registry:', error);
    return NextResponse.json({
      success: true,
      media: []
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Upload to central agent registry
    const mediaPayload = {
      agentId: MIYOMI_AGENT_ID,
      agentName: 'Miyomi',
      ...data,
      uploadedAt: new Date().toISOString(),
      metadata: {
        source: 'miyomi_dashboard',
        type: data.type || 'video',
        market: data.marketTitle,
        position: data.position,
        price: data.price,
        pnl: data.pnl
      }
    };
    
    const response = await fetch(`${AGENT_REGISTRY_API}/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_API_KEY || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mediaPayload)
    });
    
    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({
        success: true,
        media: result.content
      });
    }
    
    // Fallback response if API is not available
    return NextResponse.json({
      success: true,
      media: {
        id: `local_${Date.now()}`,
        ...data,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to upload to agent registry:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload media to central registry'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Media ID required'
      }, { status: 400 });
    }
    
    // Delete from central agent registry
    const response = await fetch(`${AGENT_REGISTRY_API}/content/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_API_KEY || ''}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Media deleted from central registry'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Delete request sent'
    });
  } catch (error) {
    console.error('Failed to delete from agent registry:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete media from central registry'
    }, { status: 500 });
  }
}