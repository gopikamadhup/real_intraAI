import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: Array<{
    title?: string;
    company?: string;
    duration?: string;
    description?: string;
  }>;
  education: Array<{
    degree?: string;
    institution?: string;
    year?: string;
  }>;
  summary?: string;
}

function parseResumeText(text: string): ParsedResume {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  const parsed: ParsedResume = {
    skills: [],
    experience: [],
    education: [],
  };

  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    parsed.email = emailMatch[0];
  }

  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    parsed.phone = phoneMatch[0];
  }

  const nameMatch = lines[0];
  if (nameMatch && nameMatch.length < 50 && !nameMatch.includes('@')) {
    parsed.name = nameMatch;
  }

  const skillKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel',
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'webpack', 'vite',
    'rest', 'graphql', 'api', 'microservices', 'agile', 'scrum',
    'machine learning', 'ai', 'data science', 'tensorflow', 'pytorch'
  ];

  const textLower = text.toLowerCase();
  const foundSkills = new Set<string>();
  
  skillKeywords.forEach(skill => {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  parsed.skills = Array.from(foundSkills);

  let inExperience = false;
  let inEducation = false;
  let currentExp: any = null;
  let currentEdu: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    if (lineLower.includes('experience') || lineLower.includes('work history')) {
      inExperience = true;
      inEducation = false;
      continue;
    }

    if (lineLower.includes('education') || lineLower.includes('academic')) {
      inEducation = true;
      inExperience = false;
      continue;
    }

    if (lineLower.includes('skills') || lineLower.includes('summary')) {
      inExperience = false;
      inEducation = false;
      continue;
    }

    if (inExperience) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      if (yearMatch || line.length > 20) {
        if (currentExp && (currentExp.title || currentExp.company)) {
          parsed.experience.push(currentExp);
        }
        currentExp = {
          title: line.includes('-') ? line.split('-')[0].trim() : line,
          company: line.includes('-') ? line.split('-')[1]?.trim() : undefined,
          duration: yearMatch ? line : undefined,
          description: '',
        };
      } else if (currentExp && line.length > 10) {
        currentExp.description += (currentExp.description ? ' ' : '') + line;
      }
    }

    if (inEducation) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      if (yearMatch || line.length > 15) {
        if (currentEdu && (currentEdu.degree || currentEdu.institution)) {
          parsed.education.push(currentEdu);
        }
        currentEdu = {
          degree: line,
          institution: undefined,
          year: yearMatch ? yearMatch[0] : undefined,
        };
      } else if (currentEdu && line.length > 5) {
        currentEdu.institution = line;
      }
    }
  }

  if (currentExp && (currentExp.title || currentExp.company)) {
    parsed.experience.push(currentExp);
  }
  if (currentEdu && (currentEdu.degree || currentEdu.institution)) {
    parsed.education.push(currentEdu);
  }

  const summaryMatch = text.match(/summary[:\s]+([^\n]{50,500})/i);
  if (summaryMatch) {
    parsed.summary = summaryMatch[1].trim();
  }

  return parsed;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { fileUrl, fileName, resumeId } = await req.json();

    if (!fileUrl || !fileName || !resumeId) {
      throw new Error('Missing required fields: fileUrl, fileName, resumeId');
    }

    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to fetch file from storage');
    }

    const fileBlob = await fileResponse.blob();
    const fileText = await fileBlob.text();

    const parsedData = parseResumeText(fileText);

    const { error: updateError } = await supabase
      .from('resumes')
      .update({ parsed_data: parsedData })
      .eq('id', resumeId)
      .eq('candidate_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, parsedData }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error parsing resume:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
