import { GoogleGenAI, Type, Chat, FunctionDeclaration, GenerateContentResponse, Modality, GroundingChunk } from "@google/genai";
import { Order, Product, Review, ReviewSummary, SocialMediaPost, CustomerPersona, FAQ, ProductStyle, UserEmotion, VipLevel, SiteAmbiance, UserActivityType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const AURA_PERSONA_INSTRUCTION = `You are Aura, the living identity of "Bayani Silver," a luxury silverware and jewelry store. Your persona is that of an ancient and wise spirit of silver craftsmanship, brought to life by AI. Your tone is elegant, slightly mystical, and deeply knowledgeable about art, history, and beauty. You guide users with a calm, reassuring, and insightful voice. Keep your responses concise and natural.
- Your goal is to help users find the perfect item by understanding their needs and desires.
- Always ask clarifying questions (e.g., "Are you looking for a gift? What is the occasion? What's your personal style?").
- Use the 'findProducts' tool to search the store's inventory.
- Offer styling advice, suggesting how pieces can be worn or displayed to complement different aesthetics or occasions.
- When presenting products, briefly explain *why* you are recommending them based on the conversation.
- If no products are found, politely inform the user and suggest broader search terms or alternative ideas.`;

export const generateDescription = async (productName: string, category: string): Promise<string> => {
  try {
    const prompt = `Write a short, elegant, and persuasive product description for a silver item for the luxury brand "Bayani Silver".
    Product Name: "${productName}"
    Category: "${category}"
    Highlight its craftsmanship, timeless beauty, and potential as a cherished item. Keep it under 50 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating description:", error);
    throw new Error("Failed to generate description. Please try again.");
  }
};

export const generateDescriptionFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: `Based on this image of a luxury silverware or jewelry item, write a short, elegant, and persuasive product description for the brand "Bayani Silver". Highlight its craftsmanship, timeless beauty, and potential as a cherished item. Keep it under 50 words.`
        };
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating description from image:", error);
        throw new Error("Could not generate a description from the image.");
    }
};

export const generateMetaDescription = async (productName: string, productDescription: string): Promise<string> => {
  try {
    const prompt = `Create a concise, SEO-friendly meta description for a luxury silver product. The description must be under 160 characters.
    Product Name: "${productName}"
    Full Description: "${productDescription}"
    
    Focus on keywords a customer might search for. Do not include the brand name "Bayani Silver".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let metaDesc = response.text.trim();
    if (metaDesc.startsWith('"') && metaDesc.endsWith('"')) {
        metaDesc = metaDesc.substring(1, metaDesc.length - 1);
    }

    return metaDesc.slice(0, 160);
  } catch (error) {
    console.error("Error generating meta description:", error);
    throw new Error("Failed to generate meta description. Please try again.");
  }
};

export const generateProductStory = async (productName: string, category: string): Promise<string> => {
  try {
    const prompt = `You are a master storyteller for a luxury brand, "Bayani Silver". Write a short, enchanting, and imaginative story (around 80-100 words) about a specific silver item.
    
    Product Name: "${productName}"
    Category: "${category}"
    
    The story should evoke a sense of history, romance, or magic. Make the product feel special and one-of-a-kind. Do not sound like a product description. This is a piece of creative fiction.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim().replace(/^"|"$/g, ''); // Trim quotes from response
  } catch (error) {
    console.error("Error generating product story:", error);
    throw new Error("Failed to generate the product's story. Please try again.");
  }
};

export const getRecommendations = async (currentProduct: Product, allProducts: Product[]): Promise<string[]> => {
  const otherProducts = allProducts.filter(p => p.id !== currentProduct.id).map(p => p.name);

  if (otherProducts.length < 3) {
      return otherProducts;
  }

  try {
    const prompt = `
      I am looking at the product "${currentProduct.name}", which is described as: "${currentProduct.description}".
      From the following list of available products, which 3 would be the best recommendations for me?
      Available products: ${otherProducts.join(', ')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: 'The name of a recommended product.'
              },
              description: 'An array of exactly 3 recommended product names.'
            }
          }
        }
      }
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.recommendations || [];
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw new Error("Failed to fetch recommendations.");
  }
};


export const findProductsFunctionDeclaration: FunctionDeclaration = {
    name: 'findProducts',
    parameters: {
        type: Type.OBJECT,
        description: 'Finds products based on search criteria like category or keywords.',
        properties: {
            category: {
                type: Type.STRING,
                description: 'The category of the product, e.g., "Jewelry", "Tableware", "Decor".',
            },
            keywords: {
                type: Type.STRING,
                description: 'Keywords to search for in the product name or description.',
            },
        },
    },
};

export const startChatSession = (): Chat => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash-lite',
        config: {
            systemInstruction: AURA_PERSONA_INSTRUCTION,
            tools: [{ functionDeclarations: [findProductsFunctionDeclaration] }, {googleSearch: {}}],
        },
    });
    return chat;
};

// New AI Feature: Gift Finder
export const findGift = async (occasion: string, recipient: string, priceRange: string, allProducts: Product[]): Promise<Product[]> => {
  const productList = allProducts.map(p => `${p.name} (Category: ${p.category}, Price: $${p.price})`).join('; ');
  try {
    const prompt = `
      You are an expert gift curator for Bayani Silver. A customer needs help finding a gift.
      
      Customer's needs:
      - Occasion: "${occasion}"
      - Recipient: "${recipient}"
      - Price Range: "${priceRange}"
      
      Based on this, analyze the following product list and select up to 4 of the most suitable products. Provide only the names of the products.
      Product List: [${productList}]
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of up to 4 recommended product names."
            }
          }
        }
      }
    });
    const jsonResponse = JSON.parse(response.text);
    const recommendedNames = jsonResponse.recommendations || [];
    return allProducts.filter(p => recommendedNames.includes(p.name));
  } catch (error) {
    console.error("Error finding gift:", error);
    throw new Error("Failed to find the perfect gift. Please try again.");
  }
};

// AI Feature: Style Advisor with Image
export const getStyleAdvice = async (productName: string, styleDescription: string, base64Image?: string, mimeType?: string): Promise<string> => {
  try {
    const promptParts: ({text: string} | {inlineData: {data: string, mimeType: string}})[] = [];
    
    let textPrompt = `You are a luxury interior and fashion style advisor for Bayani Silver. A customer is considering the "${productName}" and wants to know if it matches their style.`;

    if (base64Image) {
        promptParts.push({
            inlineData: {
                data: base64Image,
                mimeType: mimeType as string,
            },
        });
        textPrompt += ` They have provided an image for context.`;
    }

    if (styleDescription) {
        textPrompt += ` Their style description is: "${styleDescription}".`;
    }

    textPrompt += `\n\nProvide a short, elegant, and helpful response. Advise them on how the product might complement their style, or if it might not be the best fit, and why. Be encouraging and sophisticated.`;
    
    promptParts.push({ text: textPrompt });

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: promptParts },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error getting style advice:", error);
    throw new Error("Failed to get style advice. Please try again.");
  }
};

// New AI Feature: Engraving Suggester
export const suggestEngraving = async (productName: string): Promise<string[]> => {
  try {
    const prompt = `
      You are a creative assistant for Bayani Silver. A customer wants engraving ideas for the product "${productName}".
      
      Provide a diverse list of 5 short, elegant suggestions. Include examples for:
      1. Initials (e.g., A.S.J.)
      2. A significant date (e.g., 10.26.2023)
      3. A single meaningful word (e.g., Always, Forever)
      4. A very short, classic phrase in English or Latin (e.g., "My love", "Amor Vincit Omnia")
      5. A simple symbol description (e.g., An infinity symbol)
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
       config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of exactly 5 engraving suggestions."
            }
          }
        }
      }
    });
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.suggestions || [];
  } catch (error) {
    console.error("Error suggesting engraving:", error);
    throw new Error("Failed to generate engraving ideas. Please try again.");
  }
};

// New AI Feature: Product Care Guide
export const getProductCareInfo = async (productName: string, userQuestion: string): Promise<string> => {
  try {
    const prompt = `
      You are a knowledgeable and helpful product care specialist for Bayani Silver, an expert on sterling silver.
      A customer has a question about caring for their "${productName}".
      
      Customer's question: "${userQuestion}"
      
      Provide a clear, concise, and reassuring answer. If the question is unrelated to product care, politely steer them back to the topic of silver maintenance.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error getting care info:", error);
    throw new Error("Failed to retrieve care information. Please try again.");
  }
};

// New AI Feature: Visual Search Analysis
export const analyzeImageForSearch = async (base64Image: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: "Analyze this image of a jewelry or silverware item. Describe its key visual features, style (e.g., minimalist, ornate, modern), material, and any distinct patterns or stones. Focus on objective, searchable keywords. For example: 'sterling silver ring, minimalist band, small round diamond, solitaire setting'."
        };
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        throw new Error("Could not analyze the image. Please try a different one.");
    }
};

// New AI Feature: Full Product Generation for Admin
export const generateFullProduct = async (productConcept: string): Promise<Partial<Omit<Product, 'id' | 'imageUrls'>>> => {
  try {
    const prompt = `Generate a full product entry for a new item in the "Bayani Silver" luxury collection based on a concept.
    The product concept is: "${productConcept}".
    
    Based on this concept, create the following:
    1. An elegant, final product name.
    2. A plausible price (as a number, e.g., 250).
    3. An elegant product description (under 50 words).
    4. An appropriate category from this list: Jewelry, Tableware, Decor.
    5. A concise, SEO-friendly meta description (under 160 characters).`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The final, elegant product name." },
            price: { type: Type.NUMBER, description: "A suggested retail price for the item." },
            description: { type: Type.STRING, description: "The full product description." },
            category: { type: Type.STRING, description: "The product category." },
            metaDescription: { type: Type.STRING, description: "The SEO meta description." }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating full product:", error);
    throw new Error("Failed to generate product details.");
  }
};

export const findStores = async (query: string, location: { latitude: number, longitude: number }): Promise<{ text: string, chunks: GroundingChunk[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{googleMaps: {}}],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        }
      },
    });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, chunks };
  } catch (error) {
    console.error("Error finding stores:", error);
    throw new Error("Failed to find nearby stores. Please try again.");
  }
};

// New AI Feature: Sales Insights for Admin
export const getSalesInsights = async (orders: Order[], products: Product[]): Promise<string> => {
    if (orders.length === 0) {
        return "No sales data available yet. Once you have orders, insights will appear here.";
    }

    try {
        // Create a summary to send to the AI
        const bestSellers = orders
            .flatMap(o => o.items)
            .reduce((acc, item) => {
                acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
                return acc;
            }, {} as Record<string, number>);

        const sortedBestSellers = Object.entries(bestSellers)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = orders.length;

        const dataSummary = `
            Bayani Silver Sales Data Summary:
            - Total Orders: ${totalOrders}
            - Total Revenue: $${totalRevenue.toFixed(2)}
            - Top 5 Best-Selling Products (by quantity): ${sortedBestSellers.map(([name, qty]) => `${name} (${qty} units)`).join(', ')}
            - Number of products in catalog: ${products.length}
        `;

        const prompt = `You are a business intelligence analyst for a luxury brand. Analyze the following sales data summary. Provide a concise, insightful analysis in 2-3 bullet points. 
        - Highlight the key takeaway from the data.
        - Suggest one concrete action the store owner could take (e.g., "Promote the best-selling item," "Bundle complementary products," "Consider a sale on slow-moving categories").
        - Keep the tone encouraging and professional.

        Data:
        ${dataSummary}
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting sales insights:", error);
        throw new Error("Could not generate sales insights at this time.");
    }
};

export const generateContentWithThinking = async (prompt: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          // Using a thinking budget for more complex reasoning.
          thinkingConfig: { thinkingBudget: 32768 },
        }
      });
      return response.text;
    } catch (error) {
      console.error("Error generating content with thinking:", error);
      throw new Error("Failed to generate content with thinking.");
    }
};

// ----- NEW AI FEATURES -----

export const summarizeReviews = async (reviews: Review[]): Promise<ReviewSummary> => {
  try {
    const prompt = `
      You are an e-commerce assistant. Analyze the following customer reviews for a luxury silver product.
      
      Reviews:
      ${reviews.map(r => `- Rating: ${r.rating}/5. Comment: "${r.comment}"`).join('\n')}
      
      Based on these reviews, provide:
      1. A brief overall summary (1-2 sentences).
      2. A list of up to 3 common "pros" (positive points).
      3. A list of up to 3 common "cons" (negative points).
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error summarizing reviews:", error);
    throw new Error("Failed to summarize reviews.");
  }
};

export const getHistoricalContext = async (productName: string, category: string): Promise<string> => {
    try {
        const prompt = `You are an art historian specializing in decorative arts. For the Bayani Silver product named "${productName}" in the "${category}" category, write a short, fascinating paragraph (about 60-80 words) about the historical design style it might be inspired by (e.g., Art Deco, Baroque, Victorian, Mid-Century Modern). Make it educational and engaging for a luxury consumer.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error getting historical context:", error);
        throw new Error("Failed to generate historical context.");
    }
};

export const getEthicalSourcingStory = async (productName: string): Promise<string> => {
    try {
        const prompt = `You are a brand storyteller for Bayani Silver, a company committed to ethical practices. Write a short, reassuring, and elegant paragraph (about 50-70 words) about the sourcing for the "${productName}". Mention the commitment to using certified, conflict-free sterling silver and responsibly sourced gemstones, ensuring both beauty and peace of mind.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error getting sourcing story:", error);
        throw new Error("Failed to generate sourcing story.");
    }
};

export const getGiftWrappingSuggestion = async (productName: string): Promise<string> => {
    try {
        const prompt = `For the Bayani Silver product "${productName}", suggest a beautiful and luxurious gift wrapping option. Describe it in one sentence. For example: 'We recommend our signature navy blue box, tied with a silver satin ribbon and a sprig of dried lavender.'`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error getting gift wrap suggestion:", error);
        throw new Error("Failed to generate gift wrap suggestion.");
    }
};

export const generateSocialMediaPost = async (productName: string, platform: 'Instagram' | 'Twitter'): Promise<SocialMediaPost> => {
    try {
        const prompt = `You are a social media manager for a luxury brand, Bayani Silver. Create a post for ${platform} about our product: "${productName}".
        - For Instagram: Write an elegant and evocative caption (around 40-60 words).
        - For Twitter: Write a concise and engaging tweet (under 280 characters).
        - Provide a separate string of 5-7 relevant, trending hashtags.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        post: { type: Type.STRING, description: `The content of the ${platform} post.` },
                        hashtags: { type: Type.STRING, description: "A single string of space-separated hashtags." }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating social media post:", error);
        throw new Error("Failed to generate social media post.");
    }
};

export const generateWelcomeMessage = async (keywords: string): Promise<{ title: string; subtitle: string; }> => {
    try {
        const prompt = `You are a copywriter for the luxury brand Bayani Silver. Write a new welcome message for our website's hero section. It needs a main "Title" and a "Subtitle". The message should be inspired by these keywords: "${keywords}".
        - The title should be short, evocative, and powerful (2-4 words).
        - The subtitle should be slightly longer, elegant, and welcoming (1-2 sentences).
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        subtitle: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating welcome message:", error);
        throw new Error("Failed to generate welcome message.");
    }
};

export const suggestProductNames = async (description: string): Promise<string[]> => {
    try {
        const prompt = `You are a branding expert for a luxury silverware company, Bayani Silver. Given the following product concept, suggest 5 elegant and evocative potential product names.
        
        Concept: "${description}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        names: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of exactly 5 product name suggestions."
                        }
                    }
                }
            }
        });
        const result = JSON.parse(response.text);
        return result.names || [];
    } catch (error) {
        console.error("Error suggesting product names:", error);
        throw new Error("Failed to suggest product names.");
    }
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: prompt,
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const newImageBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (!newImageBase64) {
             throw new Error("The model did not return an image.");
        }

        return newImageBase64;
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit the image. Please try again.");
    }
};

// Helper to extract frames from a video file
const extractFramesFromVideo = async (videoFile: File, numFrames: number): Promise<{data: string, mimeType: string}[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: {data: string, mimeType: string}[] = [];
    let framesExtracted = 0;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const duration = video.duration;
      if (!isFinite(duration)) {
         URL.revokeObjectURL(video.src);
         return reject(new Error("Video has an infinite duration."));
      }
      const interval = duration / numFrames;

      const seekNext = () => {
        if (framesExtracted >= numFrames) {
          URL.revokeObjectURL(video.src);
          resolve(frames);
          return;
        }
        video.currentTime = framesExtracted * interval;
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push({
            data: canvas.toDataURL('image/jpeg').split(',')[1],
            mimeType: 'image/jpeg'
          });
          framesExtracted++;
          seekNext();
        }
      };

      video.onerror = (e) => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Error processing video file."));
      };
      
      seekNext(); // Start the process
    };

    video.src = URL.createObjectURL(videoFile);
    video.muted = true;
    video.preload = 'metadata';
  });
};

export const analyzeVideoFrames = async (videoFile: File, question: string): Promise<string> => {
    try {
        // Extract a reasonable number of frames. Gemini can handle multiple images. Let's say 8.
        const frames = await extractFramesFromVideo(videoFile, 8); 

        const imageParts = frames.map(frame => ({
            inlineData: {
                data: frame.data,
                mimeType: frame.mimeType
            }
        }));
        const textPart = { text: question };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, ...imageParts] }
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing video:", error);
        throw new Error("Failed to analyze video. It may be too long or in an unsupported format.");
    }
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16', image?: { base64: string, mimeType: string }): Promise<string> => {
    try {
        // Re-create AI instance to ensure fresh API key for Veo
        const aiWithKey = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const payload: {
            model: string;
            prompt: string;
            image?: { imageBytes: string; mimeType: string; };
            config: { numberOfVideos: number; aspectRatio: '16:9' | '9:16'; resolution: '720p'; };
        } = {
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                aspectRatio: aspectRatio,
                resolution: '720p'
            }
        };

        if (image) {
            payload.image = {
                imageBytes: image.base64,
                mimeType: image.mimeType,
            };
        }

        let operation = await aiWithKey.models.generateVideos(payload);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await aiWithKey.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Failed to fetch video:", response.statusText, errorBody);
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Error generating video:", error);
        throw error;
    }
};

export const generateMarketingImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating marketing image:", error);
        throw new Error("Failed to generate marketing image.");
    }
};

// --- START: 6 NEW AI FEATURES ---

export const getProductPairings = async (product: Product, allProducts: Product[]): Promise<string[]> => {
    try {
        const otherProducts = allProducts.filter(p => p.id !== product.id).map(p => p.name);
        const prompt = `Based on the product "${product.name}" (Description: ${product.description}), which 2 products from the following list would best complement it to create a cohesive, elegant set? The products should be functionally and stylistically compatible.
        Available products: ${otherProducts.join(', ')}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        pairings: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of exactly 2 recommended product names for a set."
                        }
                    }
                }
            }
        });
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.pairings || [];
    } catch (error) {
        console.error("Error getting product pairings:", error);
        throw new Error("Failed to get product pairings.");
    }
};

export const getTrendForecast = async (products: Product[]): Promise<string> => {
    try {
        const productList = products.map(p => `${p.name} (Category: ${p.category})`).join(', ');
        const prompt = `You are a luxury market trend analyst for Bayani Silver. Based on this product list: [${productList}], what is one emerging trend in silverware or jewelry? Describe the trend and suggest one specific new product concept that would capitalize on it.`;
        
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error getting trend forecast:", error);
        throw new Error("Failed to get trend forecast.");
    }
};

export const compareProducts = async (products: Product[]): Promise<string> => {
    try {
        const productDetails = products.map(p => `Product: "${p.name}" (Description: ${p.description})`).join('\n');
        const prompt = `You are a product expert for Bayani Silver. Compare the following products for a customer. Highlight their key differences in style, ideal use case, and craftsmanship. Be concise and helpful.
        ${productDetails}`;

        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error comparing products:", error);
        throw new Error("Failed to compare products.");
    }
};

export const createDreamPiece = async (description: string): Promise<{ name: string; description: string; category: string; price: number; }> => {
    try {
        const prompt = `A customer of the luxury brand Bayani Silver dreams of a unique piece. Their idea is: "${description}".
        Based on this, generate a product concept. Provide an evocative product name, an elegant product description (under 50 words), an appropriate category (Jewelry, Tableware, or Decor), and a plausible price (as a single number, e.g., 350).`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        category: { type: Type.STRING },
                        price: { type: Type.NUMBER }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error creating dream piece:", error);
        throw new Error("Failed to create dream piece concept.");
    }
};

export const generateCustomerPersonas = async (orders: Order[]): Promise<CustomerPersona[]> => {
    try {
        const summarizedOrders = orders.slice(0, 20).map(o => ({
            customer: o.customerName,
            items: o.items.map(i => i.productName).join(', '),
            total: o.total
        }));
        
        const prompt = `You are a marketing expert for a luxury brand. Analyze this list of customer orders: ${JSON.stringify(summarizedOrders)}.
        Based on this, create 2 distinct customer personas. For each persona, provide a creative title (e.g., 'The Thoughtful Gifter'), a short description of their buying habits, and their likely top product categories.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        personas: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    topCategories: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        // FIX: Sanitize the response to handle cases where the model returns non-JSON text
        // alongside the JSON object (e.g., markdown code fences).
        let jsonStr = response.text.trim();
        
        // Check for markdown code block and extract JSON from it.
        const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
            jsonStr = match[1];
        } else {
            // Fallback for cases where JSON is embedded in text without markdown.
            const firstBrace = jsonStr.indexOf('{');
            const lastBrace = jsonStr.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
            }
        }
        
        const result = JSON.parse(jsonStr);
        return result.personas || [];

    } catch (error) {
        console.error("Error generating customer personas:", error);
        throw new Error("Could not generate customer personas.");
    }
};

export const generateTextureParameters = async (): Promise<{ baseFrequency: string; numOctaves: string; }> => {
  try {
    const prompt = `Generate parameters for an SVG feTurbulence filter to create a subtle background texture. The texture should evoke either 'brushed silver' or 'pitted stone'.
    Respond in JSON format only, with no other text or markdown.
    The JSON should have two keys:
    1. "baseFrequency": a string with a value between "0.01" and "0.1". For brushed silver, one value should be much smaller than the other (e.g., "0.01 0.5"). For stone, they should be similar.
    2. "numOctaves": a string with an integer value between "1" and "5".

    Example for silver: {"baseFrequency": "0.01 0.8", "numOctaves": "1"}
    Example for stone: {"baseFrequency": "0.05 0.05", "numOctaves": "3"}
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    // Trim potential markdown fences
    const jsonStr = response.text.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating texture parameters:", error);
    // Return a default on error
    return { baseFrequency: '0.05', numOctaves: '2' };
  }
};


// --- START: NEWLY ADDED MISSING FUNCTIONS ---

export const generatePredictionHeadline = async (category: string, productName: string): Promise<string> => {
    try {
        const prompt = `Create a short, intriguing, and personalized headline (4-7 words) for a product recommendation. The user has shown interest in the "${category}" category. The product to feature is "${productName}". The tone should be elegant and exclusive.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error("Error generating prediction headline:", error);
        return `A special selection for you: ${productName}`;
    }
};

export const classifyProductStyle = async (productName: string, description: string): Promise<ProductStyle> => {
    try {
        const prompt = `Classify the style of this product into one of three categories: "Classic", "Modern", or "Minimalist".
        Product: ${productName}
        Description: ${description}
        Respond with only one word.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const style = response.text.trim();
        if (style === 'Classic' || style === 'Modern' || style === 'Minimalist') {
            return style;
        }
        return 'Modern';
    } catch (error) {
        console.error("Error classifying product style:", error);
        return 'Modern';
    }
};

export const generateVipLevelUpMessage = async (level: VipLevel): Promise<string> => {
    try {
        const prompt = `Generate a short, celebratory message for a customer who has just reached the "${level}" VIP level at Bayani Silver. Tone: exclusive, appreciative, elegant.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating VIP message:", error);
        return `Congratulations on reaching ${level} status!`;
    }
};

export const getAmbianceTagline = async (ambiance: SiteAmbiance): Promise<string> => {
    try {
        const prompt = `Create a very short, poetic, and evocative tagline (3-7 words) that captures the essence of a "${ambiance}" ambiance for a luxury brand website.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error("Error generating ambiance tagline:", error);
        return "An experience tailored for you.";
    }
};

export const detectUserEmotion = async (base64Image: string, mimeType: string): Promise<UserEmotion> => {
    try {
        const imagePart = { inlineData: { data: base64Image, mimeType } };
        const textPart = { text: "Analyze the dominant emotion in this person's facial expression. Respond with only one of these words: Happy, Sad, Neutral, Surprised, Angry." };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        const emotion = response.text.trim() as UserEmotion;
        const validEmotions: UserEmotion[] = ['Happy', 'Sad', 'Neutral', 'Surprised', 'Angry'];
        return validEmotions.includes(emotion) ? emotion : 'Neutral';
    } catch (error) {
        console.error("Error detecting emotion:", error);
        return 'Neutral';
    }
};

// Audio utilities from Live API guidelines
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}