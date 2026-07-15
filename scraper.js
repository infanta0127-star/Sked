import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS = [
  { id: 'paladin', name: '騎士', category: 'tank' },
  { id: 'warrior', name: '戰士', category: 'tank' },
  { id: 'darkknight', name: '暗黑騎士', category: 'tank' },
  { id: 'gunbreaker', name: '絕槍戰士', category: 'tank' },
  { id: 'whitemage', name: '白魔道士', category: 'healer' },
  { id: 'scholar', name: '學者', category: 'healer' },
  { id: 'astrologian', name: '占星術師', category: 'healer' },
  { id: 'sage', name: '賢者', category: 'healer' },
  { id: 'monk', name: '武僧', category: 'melee' },
  { id: 'dragoon', name: '龍騎士', category: 'melee' },
  { id: 'ninja', name: '忍者', category: 'melee' },
  { id: 'samurai', name: '武士', category: 'melee' },
  { id: 'reaper', name: '奪魂者', category: 'melee' },
  { id: 'viper', name: '毒蛇劍士', category: 'melee' },
  { id: 'bard', name: '吟遊詩人', category: 'ranged' },
  { id: 'machinist', name: '機工士', category: 'ranged' },
  { id: 'dancer', name: '舞者', category: 'ranged' },
  { id: 'blackmage', name: '黑魔道士', category: 'caster' },
  { id: 'summoner', name: '召喚士', category: 'caster' },
  { id: 'redmage', name: '赤魔道士', category: 'caster' },
  { id: 'pictomancer', name: '繪靈法師', category: 'caster' },
  { id: 'bluemage', name: '青魔道士', category: 'caster' }
];

async function downloadFile(url, destPath) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(destPath, buffer);
}

async function scrapeJob(job) {
  const url = `https://www.ffxiv.com.tw/web/intro/guide/battle/${job.id}/`;
  console.log(`Fetching ${job.name} (${job.id}) from ${url}...`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch page for ${job.id}`);
  }
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const skills = [];
  
  // Select active skills table rows in PvE section
  const rows = $('.job__content--battle.js__select--pve tbody tr').filter((i, el) => {
    const id = $(el).attr('id');
    return id && (
      id.startsWith('pve_action__') || 
      id.includes('action__')
    ) && !id.includes('pvp');
  });
  
  console.log(`Found ${rows.length} skills for ${job.name}.`);
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const id = $(row).attr('id');
    const rawName = $(row).find('.skill strong').text().trim();
    if (!rawName) continue;
    
    // Clean suffix like '透過特職任務獲得' from skill name
    const name = rawName.replace(/透過.*任務獲得/, '').trim();
    
    const level = $(row).find('.jobclass p').text().trim();
    const classification = $(row).find('.classification').text().trim();
    const cast = $(row).find('.cast').text().trim();
    const recast = $(row).find('.recast').text().trim();
    const cost = $(row).find('.cost').text().trim();
    const range = $(row).find('.distant_range').text().trim().replace(/\s+/g, ' ');
    
    // Clean up effect description html to readable text with line breaks
    const effectHtml = $(row).find('.content__info').html() || '';
    const effect = effectHtml.trim().replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    
    const imgEl = $(row).find('.skill img');
    const imgSrc = imgEl.attr('src');
    
    let localIconPath = '';
    if (imgSrc) {
      const absoluteImgUrl = new URL(imgSrc, url).toString();
      const ext = path.extname(absoluteImgUrl).split('?')[0] || '.png';
      const filename = `${id}${ext}`;
      localIconPath = `./icons/${job.id}/${filename}`;
      const destPath = path.join(__dirname, 'icons', job.id, filename);
      
      try {
        await downloadFile(absoluteImgUrl, destPath);
      } catch (err) {
        console.error(`Failed to download icon for ${name} from ${absoluteImgUrl}:`, err.message);
      }
    }
    
    skills.push({
      id,
      name,
      level,
      classification,
      cast,
      recast,
      cost,
      range,
      effect,
      icon: localIconPath
    });
  }
  
  return skills;
}

async function main() {
  const results = {};
  
  // Make sure directories exist
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  for (const job of JOBS) {
    try {
      const skills = await scrapeJob(job);
      results[job.id] = {
        id: job.id,
        name: job.name,
        category: job.category,
        skills
      };
      // Wait a little bit to avoid overloading the site
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error scraping ${job.name}:`, error);
    }
  }
  
  const outputPath = path.join(dataDir, 'jobs_skills.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Scraping complete! Data saved to ${outputPath}`);
}

main();
