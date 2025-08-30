// Vercel Serverless Function - 이메일 알림 목록 조회 API
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // 간단한 인증 체크
      const { admin } = req.query;
      if (admin !== 'retreat2024') {
        return res.status(401).json({ 
          success: false, 
          message: '인증이 필요합니다.' 
        });
      }

      // Vercel KV에서 이메일 알림 목록 조회
      let emailNotifications = [];
      
      try {
        const { kv } = await import('@vercel/kv');
        const notificationIds = await kv.lrange('email_notifications', 0, -1);
        
        for (const id of notificationIds) {
          const data = await kv.get(`email_notification:${id}`);
          if (data) {
            emailNotifications.push(typeof data === 'string' ? JSON.parse(data) : data);
          }
        }
      } catch (kvError) {
        console.log('KV not configured, returning empty list');
      }
      
      res.status(200).json({ 
        success: true,
        data: emailNotifications,
        count: emailNotifications.length
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