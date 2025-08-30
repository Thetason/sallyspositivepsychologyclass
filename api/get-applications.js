// Vercel Serverless Function - 신청 목록 조회 API
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

  if (req.method === 'GET') {
    try {
      // 간단한 인증 체크 (쿼리 파라미터로 확인)
      const { admin } = req.query;
      if (admin !== 'retreat2024') {
        return res.status(401).json({ 
          success: false, 
          message: '인증이 필요합니다.' 
        });
      }

      // Vercel KV에서 데이터 조회
      let applications = [];
      
      try {
        const { kv } = await import('@vercel/kv');
        const applicationIds = await kv.lrange('applications', 0, -1);
        
        for (const id of applicationIds) {
          const data = await kv.get(`application:${id}`);
          if (data) {
            applications.push(typeof data === 'string' ? JSON.parse(data) : data);
          }
        }
      } catch (kvError) {
        console.log('KV not configured, using test data');
        // KV가 설정되지 않은 경우 테스트 데이터 사용
        applications = [
          {
            id: 1,
            name: "테스트 신청자",
            birthdate: "1970-01-01",
            phone: "010-1234-5678",
            email: "test@example.com",
            retreat_date: "5-7",
            motivation: "참가 동기 테스트",
            timestamp: new Date().toISOString()
          }
        ];
      }
      
      res.status(200).json({ 
        success: true,
        data: applications,
        count: applications.length
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