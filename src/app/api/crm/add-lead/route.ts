import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

interface UserInfo {
  name: string;
  email: string;
  businessName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const userInfo: UserInfo = await request.json();
    
    // Save to local file as backup (for development)
    try {
      const filePath = path.join(process.cwd(), 'leads-backup.json');
      let leads = [];
      try {
        const data = await readFile(filePath, 'utf-8');
        leads = JSON.parse(data);
      } catch (e) {
        // File doesn't exist yet
      }
      leads.push({
        ...userInfo,
        timestamp: new Date().toISOString(),
        source: 'menu-analyzer'
      });
      await writeFile(filePath, JSON.stringify(leads, null, 2));
    } catch (fileError) {
      console.warn('Could not save lead to backup file:', fileError);
    }
    
    // GoHighLevel API configuration
    const ghlApiKey = process.env.GHL_API_KEY;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    
    if (!ghlApiKey || !ghlLocationId) {
      console.warn('GoHighLevel credentials not configured - using test mode');
      console.log('New lead captured (test mode):', {
        name: userInfo.name,
        email: userInfo.email,
        businessName: userInfo.businessName,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ success: true, message: 'Lead captured in test mode' });
    }

    // Create contact in GoHighLevel
    const contactData = {
      firstName: userInfo.name.split(' ')[0],
      lastName: userInfo.name.split(' ').slice(1).join(' ') || '',
      email: userInfo.email,
      companyName: userInfo.businessName || '',
      tags: ['menu-analyzer-lead', 'free-analysis'],
      customFields: [
        {
          id: 'business_name',
          value: userInfo.businessName || ''
        }
      ]
    };

    const response = await fetch(`https://services.leadconnectorhq.com/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlApiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        ...contactData,
        locationId: ghlLocationId
      })
    });

    if (!response.ok) {
      throw new Error(`GoHighLevel API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Optionally trigger a workflow/campaign
    if (result.contact?.id) {
      try {
        await fetch(`https://services.leadconnectorhq.com/contacts/${result.contact.id}/campaigns`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ghlApiKey}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
          },
          body: JSON.stringify({
            campaignId: process.env.GHL_WELCOME_CAMPAIGN_ID
          })
        });
      } catch (campaignError) {
        console.warn('Failed to trigger welcome campaign:', campaignError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      contactId: result.contact?.id,
      message: 'Lead added successfully' 
    });

  } catch (error) {
    console.error('CRM integration error:', error);
    // Return success even if CRM fails to not block user flow
    return NextResponse.json({ 
      success: true, 
      message: 'Lead captured (CRM offline)', 
      testMode: true 
    });
  }
}