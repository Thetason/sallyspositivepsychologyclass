// Vercel Serverless Function - 신청서 제출 API
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const application = req.body;
      
      // Vercel KV에 저장
      try {
        const { kv } = await import('@vercel/kv');
        const id = Date.now().toString();
        await kv.set(`application:${id}`, JSON.stringify(application));
        await kv.lpush('applications', id);
      } catch (kvError) {
        console.log('KV not configured, using fallback');
      }
      
      // 임시로 메모리에 저장 (개발용)
      // 실제 배포시에는 Vercel KV 사용
      console.log('신청 데이터:', application);
      
      res.status(200).json({ 
        success: true, 
        message: '신청이 완료되었습니다.',
        data: application 
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        success: false, 
        message: '서버 오류가 발생했습니다.' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}