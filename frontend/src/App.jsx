import './styles.css'
import { useState } from 'react';
import ReactMarkdown from "react-markdown";

export default function Homepage() {
    const [rewriteText, setRewriteText] = useState("Your polished post");
    const [analysisText, setAnalysisText] = useState("Your post analysis will appear here...");
    const [recommendationText, setRecommendationText] = useState("Your recommendations will appear here...");
    const [loading, setLoading] = useState(false);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const parseSections = (text = "") => {
        if (!text.trim()) return [];
        const regex = /(^|\n)([A-Z][\w\s/&+-]{1,100}?):\s*([\s\S]*?)(?=\n[A-Z][\w\s/&+-]{1,100}?:|\s*$)/g;
        const out = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            out.push({ title: match[2]?.trim() || "Untitled", content: match[3]?.trim() || "" });
        }
        return out.length ? out : [{ title: "Notes", content: text }];
    };

    const formatSections = (text) =>
        parseSections(text).map(({ title, content }, idx) => (
            <div key={idx} className="section-block">
                <h5 className="block-title">{title}</h5>
                <div className="block-content">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        ));

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("https://unthinkable-assessment-1.onrender.com/analyze", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to fetch analysis");
            const data = await res.json();
            const analysis = data.analysis || {};

            setAnalysisText(`
Sentiment: ${analysis.sentiment || "N/A"}
Readability: ${analysis.readability || "N/A"}
Issues: ${(analysis.issues || []).join(", ") || "None"}
            `);

            setRecommendationText(`
Hashtags: ${(analysis.suggestions?.hashtags || []).join(" ") || "N/A"}
Call-to-Action: ${analysis.suggestions?.["call-to-action"] || "N/A"}
            `);

            setRewriteText(analysis.suggestions?.improved_post || "No rewrite returned.");
        } catch (err) {
            console.error(err);
            setAnalysisText("⚠️ Error fetching analysis.");
            setRecommendationText("⚠️ Error fetching recommendations.");
            setRewriteText("⚠️ Error fetching rewrite.");
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add("drag-active"); };
    const handleDragLeave = (e) => { e.preventDefault(); e.currentTarget.classList.remove("drag-active"); };
    const handleDrop = (e) => { e.preventDefault(); e.currentTarget.classList.remove("drag-active"); handleFileChange(e); };

    return (
        <div className="page">
            <header className="app-header">📊 Social Media Analyzer</header>
            <p className="tagline">Upload your content and let AI refine it</p>

            <div
                className="upload-zone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <label htmlFor="fileInput">
                    <div className="upload-circle">⬆️</div>
                    <p>Drag & drop or click to select a file</p>
                </label>
                <input id="fileInput" type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={handleFileChange} />
            </div>

            {loading && <div className="loading">⏳ Processing...</div>}

            <main className="results">
                <section className="result-card">
                    <h3>Analysis</h3>
                    <div>{formatSections(analysisText)}</div>
                    <button onClick={() => handleCopy(analysisText)} className="btn">Copy</button>
                </section>

                <section className="result-card">
                    <h3>Recommendations</h3>
                    <div>{formatSections(recommendationText)}</div>
                    <button onClick={() => handleCopy(recommendationText)} className="btn">Copy</button>
                </section>

                <section className="result-card">
                    <h3>AI Rewrite</h3>
                    <div>{formatSections(rewriteText)}</div>
                    <button onClick={() => handleCopy(rewriteText)} className="btn">Copy</button>
                </section>
            </main>
        </div>
    );
}
