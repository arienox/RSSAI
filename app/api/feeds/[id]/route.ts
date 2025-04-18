import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Delete the feed (articles will be deleted automatically via cascade)
    const { error } = await supabase
      .from('feeds')
      .delete()
      .eq('id', id);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: 'Feed not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({ message: 'Feed deleted successfully' });
  } catch (error) {
    console.error('Error deleting feed:', error);
    return NextResponse.json(
      { message: 'Failed to delete feed', error: (error as Error).message },
      { status: 500 }
    );
  }
} 