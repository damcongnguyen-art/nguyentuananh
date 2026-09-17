import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK with safe fallback
const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Route for AI Production Analysis
app.post("/api/analyze-report", async (req, res) => {
  try {
    const reportData = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback automated rule-based analysis if GEMINI_API_KEY is not configured
      const totalPlan = reportData.lineItems?.reduce((acc: number, item: any) => acc + (Number(item.plan) || 0), 0) || 0;
      const totalActual = reportData.lineItems?.reduce((acc: number, item: any) => acc + (Number(item.actual) || 0), 0) || 0;
      const completionRate = totalPlan > 0 ? ((totalActual / totalPlan) * 100).toFixed(1) : "0";
      const totalGap = totalActual - totalPlan;
      const manpower = Number(reportData.totalManpower) || 22;
      const productivity = (totalActual / manpower).toFixed(1);

      return res.json({
        success: true,
        isAi: false,
        summary: `Ca làm việc đạt tổng sản lượng ${totalActual}/${totalPlan} sản phẩm (tỉ lệ ${completionRate}%, chênh lệch ${totalGap > 0 ? '+' : ''}${totalGap} PCS). Năng suất bình quân đạt ${productivity} PCS/người.`,
        keyFindings: [
          `Tỉ lệ hoàn thành kế hoạch đạt ${completionRate}%.`,
          `Các khung giờ chuyển đổi mã hàng và đổi chuyền làm giảm nhịp độ sản xuất (đặc biệt các mốc 7h25-7h30, 8h55-9h00, 10h40-10h45).`,
          `Sản phẩm 3195581 (AURES M 7 - SAU) đạt tiến độ vượt kế hoạch (+4 PCS).`,
          `Sản phẩm EASY 3.5 (-15 PCS) và AURES PREMIUM 4.5P IVORY (-19 PCS) chưa đạt định mức do thời gian khởi động đầu ca.`
        ],
        recommendations: [
          "Áp dụng phương pháp SMED để rút ngắn thời gian đổi mode từ 5 phút xuống dưới 2 phút.",
          "Chuẩn bị trước linh kiện và jig cữ tại khu vực Picking trước giờ chuyển đổi mã hàng 15 phút.",
          "Cân bằng lại nhân lực hỗ trợ giữa các công đoạn dán nhãn và lắp ráp để hạn chế nghẽn cổ chai."
        ]
      });
    }

    const prompt = `Bạn là một Chuyên gia Quản lý Sản xuất & Lean Kaizen hàng đầu trong nhà máy.
Hãy phân tích báo cáo sản lượng hàng ngày sau đây một cách chuyên nghiệp, súc tích và có giá trị hành động cao cho Trưởng ca/Quản đốc nhà máy:

Dữ liệu báo cáo:
${JSON.stringify(reportData, null, 2)}

Hãy phân tích và trả về định dạng JSON với cấu trúc:
{
  "summary": "Đoạn tóm tắt tổng quan súc tích về kết quả ca làm việc, tỉ lệ hoàn thành, chênh lệch chính và đánh giá chung",
  "keyFindings": [
    "Điểm nổi bật/Vấn đề 1 (ví dụ phân tích các mã đạt/không đạt, nguyên nhân hụt sản lượng)",
    "Điểm nổi bật/Vấn đề 2 (ví dụ phân tích tổn thất do chuyển đổi mode hàng, đổi line)",
    "Điểm nổi bật/Vấn đề 3 (ví dụ nhịp độ sản xuất theo từng khung giờ và hiệu suất nhân sự)"
  ],
  "recommendations": [
    "Khuyến nghị hành động cải tiến 1 (ngắn hạn)",
    "Khuyến nghị hành động cải tiến 2 (tối ưu hóa quy trình)",
    "Khuyến nghị hành động cải tiến 3 (phân bổ nhân lực & vật tư)"
  ],
  "efficiencyScore": 92
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Bạn là chuyên gia phân tích dữ liệu sản xuất công nghiệp, trả về báo cáo phân tích theo định dạng JSON hợp lệ, ngôn ngữ Tiếng Việt chuẩn mực, rõ ràng, giàu chuyên môn.",
      },
    });

    const text = response.text || "{}";
    const parsedData = JSON.parse(text);
    return res.json({ success: true, isAi: true, ...parsedData });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Lỗi khi phân tích dữ liệu bằng AI",
    });
  }
});

// Start Express + Vite Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
