// Vercel Serverless Function - 이메일 알림 API
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
      const { email, timestamp } = req.body;
      
      // 이메일 전송 (Fetch API로 외부 이메일 서비스 호출)
      // EmailJS 사용
      const emailData = {
        service_id: 'service_sally',  // EmailJS에서 생성한 서비스 ID
        template_id: 'template_notify',  // EmailJS에서 생성한 템플릿 ID
        user_id: 'YOUR_EMAILJS_PUBLIC_KEY',  // EmailJS Public Key
        template_params: {
          to_email: 'sallykimhyerim@gmail.com',
          from_email: email,
          message: `새로운 이메일 알림 신청: ${email}`,
          date: new Date(timestamp).toLocaleString('ko-KR')
        }
      };
      
      // EmailJS API 호출
      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });
      
      // Vercel KV에도 저장 (선택사항)
      try {
        const { kv } = await import('@vercel/kv');
        const id = Date.now().toString();
        await kv.set(`email_notification:${id}`, JSON.stringify({ email, timestamp }));
        await kv.lpush('email_notifications', id);
      } catch (kvError) {
        console.log('KV not configured for email notifications');
      }
      
      // 간단한 이메일 알림 (로그)
      console.log(`이메일 알림 신청: ${email} -> sallykimhyerim@gmail.com`);
      console.log(`신청 시간: ${timestamp}`);
      
      res.status(200).json({ 
        success: true, 
        message: '이메일 알림이 등록되었습니다.',
        notification: `${email} 주소가 sallykimhyerim@gmail.com으로 전달되었습니다.`
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