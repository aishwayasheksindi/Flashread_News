import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';

// Fix: must be full URL in local dev — relative /api/... goes to React port 3000, not Express 5000
const API_BASE = 'https://backendserver-three.vercel.app';

function NewsCard({ title, description, url, image, publishedAt, source, content }) {
  const [summary, setSummary] = useState('');
  const [bullets, setBullets] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSummary('');
    setBullets('');
    setSentiment('');
    setError('');
  }, [content, description]);

  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/api/ai/summarize`, {
        content,
        description,
      });
      setSummary(res.data.summary);
      setBullets(res.data.bulletPoints);
      setSentiment(res.data.sentiment);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to summarize. Please try again.';
      setError(msg);
    }
    setLoading(false);
  };

  const badge =
    sentiment === 'Positive' ? (
      <Badge bg="success">👍 Positive</Badge>
    ) : sentiment === 'Negative' ? (
      <Badge bg="danger">👎 Negative</Badge>
    ) : sentiment === 'Neutral' ? (
      <Badge bg="secondary">😐 Neutral</Badge>
    ) : null;

  const getPreview = () => {
    const text = `${description || ''} ${content || ''}`
      .replace(/\[\d+\s*chars\]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const sentences = text.split('.').map(s => s.trim()).filter(s => s.length > 0);
    let wordCount = 0;
    const result = [];
    for (const sentence of sentences) {
      const wordsInSentence = sentence.split(' ').length;
      if (wordCount + wordsInSentence <= 100) {
        result.push(sentence);
        wordCount += wordsInSentence;
      } else break;
    }
    if (result.length === 0) return 'No preview available.';
    return result.join('. ') + '. Click "Read More" to view the full article.';
  };

  return (
    <Card className="h-100 shadow-sm mb-4">
      {image && (
        <Card.Img
          variant="top"
          src={image}
          style={{ maxHeight: '180px', objectFit: 'cover' }}
          onError={e => (e.target.style.display = 'none')} // hide broken images
        />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title style={{ fontSize: '1rem' }}>{title}</Card.Title>
        <Card.Text style={{ fontSize: '0.9rem', color: '#555' }}>{getPreview()}</Card.Text>

        <div className="mt-auto mb-3">
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary me-2">
            Read More
          </a>
          <Button size="sm" variant="success" onClick={handleSummarize} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Summarizing…
              </>
            ) : (
              '✨ Summarize'
            )}
          </Button>
        </div>

        {loading && (
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>
            ⏳ AI model may take 15–30 seconds on first request…
          </p>
        )}

        {summary && (
          <div className="mt-2 p-3 bg-light rounded border">
            <h6>📝 Summary</h6>
            <p style={{ fontSize: '0.9rem' }}>{summary}</p>
            <h6>📌 Key Points</h6>
            <ul style={{ fontSize: '0.9rem' }}>
              {bullets.split('\n').filter(Boolean).map((b, i) => (
                <li key={i}>{b.replace(/^•\s*/, '')}</li>
              ))}
            </ul>
            {badge && <div className="mt-2">📊 Sentiment: {badge}</div>}
          </div>
        )}

        {error && (
          <p className="text-danger mt-2" style={{ fontSize: '0.85rem' }}>
            ⚠️ {error}
          </p>
        )}

        <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.8rem' }}>
          Source: {source?.name}
          <br />
          {publishedAt ? new Date(publishedAt).toLocaleString() : ''}
        </p>
      </Card.Body>
    </Card>
  );
}

export default NewsCard;
