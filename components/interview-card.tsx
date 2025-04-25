import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Users, Layers } from "lucide-react"

interface InterviewCardProps {
  title: string
  description: string
  type: "technical" | "behavioral" | "mixed"
  href: string
}

export function InterviewCard({ title, description, type, href }: InterviewCardProps) {
  const getIcon = () => {
    switch (type) {
      case "technical":
        return <Code className="h-5 w-5" />
      case "behavioral":
        return <Users className="h-5 w-5" />
      case "mixed":
        return <Layers className="h-5 w-5" />
      default:
        return <Code className="h-5 w-5" />
    }
  }

  return (
    <Card className="overflow-hidden interview-card group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Badge
            variant="outline"
            className={`${
              type === "technical"
                ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20"
                : type === "behavioral"
                  ? "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20"
                  : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {getIcon()}
              {type.charAt(0).toUpperCase() + type.slice(1)} Interview
            </span>
          </Badge>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-primary/10 transition-colors">
          <Link href={href} className="flex items-center justify-between w-full">
            <span>Start Interview</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
