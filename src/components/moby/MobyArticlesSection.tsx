import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Clock, Tag } from 'lucide-react';

const MobyArticlesSection = () => {
  const featuredArticle = {
    title: "อย่าทำให้ข้อมูลที่เรามีเป็นเหมือนเงินฝาก ต้องเอาไปต่อยอดไปให้เกิดประโยชน์",
    subtitle: "สรุปข้อคิดที่ได้จากงาน Martech Martalk 2024",
    author: "คุณธารินทร์ จงประเจิด CEO แห่ง 1Moby",
    coAuthor: "และคุณภาณุพงษ์ CEO แห่ง Enoactic",
    content: `"ยุคนี้ข้อมูลเปรียบเหมือนสินทรัพย์อย่าเก็บข้อมูลไว้เหมือนเงินสด เงินฝาก เพราะมันไม่งอกงามต้องเอาไปต่อยอด ลงทุนให้ธุรกิจเติบโต" คุณธารินทร์ จงประเจิด CEO แห่ง 1Moby ได้กล่าวไว้ในงาน Martech Martalk 2024...`,
    image: "/placeholder.svg",
    date: "08 พฤศจิกายน 2024",
    readTime: "4 min read",
    category: "Marketing Technology"
  };

  const articles = [
    {
      title: "มาส่องเทรนด์ Martech ปี 2025 มีแนวโน้มจะเติบโตอย่างไร",
      excerpt: "การตลาดมักจะมีกระแสใหม่ ๆ มาให้เราจับตาอยู่ตลอดเวลา แต่สิ่งหนึ่งที่เข้ามาแล้วเกิดกระแสที่แมสจนไม่มีทางที่จะถึงขาลงง่าย ๆ นั่นคือ Martech...",
      image: "/placeholder.svg",
      date: "17 ตุลาคม 2024",
      readTime: "3 min read",
      category: "Marketing Technology"
    },
    {
      title: "6 เครื่องมือ Martech แบบ Communication Platform ที่คุณไม่ควรพลาด",
      excerpt: "เครื่องมือ Martech ที่ช่วยให้เราสามารถสื่อสารกับลูกค้าได้ อย่างเครื่องมือประเภท Communication Platform มีรูปแบบอะไรบ้าง...",
      image: "/placeholder.svg",
      date: "22 สิงหาคม 2024",
      readTime: "3 min read",
      category: "Marketing Technology"
    }
  ];

  const newsItems = [
    {
      title: "คุณต๊อบ ปิโยรส ธนะนิมิตร CBDO จาก 1Moby ร่วมเป็นวิทยากรงาน Digital Marketing for B2B Bootcamp",
      subtitle: 'ในหัวข้อ "Digital sales strategy planning for b2b" ร่วมกับ Content Shifu',
      date: "16 พฤษภาคม 2025",
      type: "News",
      image: "/placeholder.svg"
    },
    {
      title: "อีกหนึ่งความภาคภูมิใจ Thaibulksms คว้า 2 รางวัลจากงาน Thailand's MarTech Report & Awards 2025",
      date: "10 กุมภาพันธ์ 2025",
      type: "News",
      image: "/placeholder.svg"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            บทความเทคโนโลยี
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            ข้อมูลที่น่าสนใจเพื่อประโยชน์ทางธุรกิจ
          </p>
          <Button 
            variant="outline" 
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            ดูบทความทั้งหมด
          </Button>
        </div>

        {/* Featured Article */}
        <div className="mb-20">
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Content */}
                <div className="p-8 lg:p-12">
                  <div className="space-y-6">
                    {/* Category & Meta */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {featuredArticle.category}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{featuredArticle.readTime}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                      "{featuredArticle.title}"
                    </h3>

                    {/* Subtitle */}
                    <p className="text-lg text-gray-700 font-medium">
                      {featuredArticle.subtitle}
                    </p>

                    {/* Authors */}
                    <div className="text-gray-600">
                      <p>โดย {featuredArticle.author}</p>
                      <p>{featuredArticle.coAuthor}</p>
                    </div>

                    {/* Content Preview */}
                    <p className="text-gray-600 leading-relaxed">
                      {featuredArticle.content}
                    </p>

                    {/* Date */}
                    <p className="text-sm text-gray-500">
                      {featuredArticle.date}
                    </p>

                    {/* Read More */}
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      อ่านเพิ่มเติม
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Image */}
                <div className="h-64 lg:h-full">
                  <img 
                    src={featuredArticle.image} 
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {articles.map((article, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <CardContent className="p-0">
                {/* Image */}
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Date */}
                  <p className="text-sm text-gray-500">
                    {article.date}
                  </p>

                  {/* Read More */}
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto text-blue-600 hover:text-blue-700 font-medium group-hover:translate-x-2 transition-transform"
                  >
                    <span className="mr-1">เพิ่มเติม</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* News Section */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              ความเคลื่อนไหว ข่าวประชาสัมพันธ์
            </h3>
            <Button 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              ดูความเคลื่อนไหวทั้งหมด
            </Button>
          </div>

          {/* News Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {newsItems.map((news, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <img 
                        src={news.image} 
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {news.title}
                      </h4>
                      
                      {news.subtitle && (
                        <p className="text-gray-600 text-sm">
                          {news.subtitle}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">{news.date}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {news.type}
                        </span>
                      </div>

                      <Button 
                        variant="ghost" 
                        className="p-0 h-auto text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <span className="mr-1">เพิ่มเติม</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobyArticlesSection;
