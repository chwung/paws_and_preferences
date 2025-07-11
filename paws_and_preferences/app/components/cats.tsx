'use client';
import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button"
import { Heart, X, RotateCcw } from "lucide-react"

interface Cat {
    id: number;
    imageUrl: string;
    liked?: boolean;
}

export default function Cats() {
    const [cats, setCats] = useState<Cat[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [likedCats, setLikedCats] = useState<Cat[]>([])
    const [showSummary, setShowSummary] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const clamp = (value: number, min: number, max: number) => {
        return Math.min(Math.max(value, min), max);
    };
    const cardRef = useRef<HTMLDivElement>(null)

    // Generate cat data with unique URLs
    const generateCats = async () => {        
        const catData: Cat[] = []
        for (let i = 0; i < 15; i++) {
            const response = await fetch(`https://cataas.com/cat?json=true`);
            const data = await response.json();
            catData.push({
                id: data,
                imageUrl: `${data.url}&width=400&height=400`,
                liked: false
            })
        }
        setCats(catData)
        setIsLoading(false)
    }

    useEffect(() => {
        generateCats()
    }, [])

    const handleSwipe = (direction: "left" | "right") => {
        if (currentIndex >= cats.length) return

        const currentCat = cats[currentIndex]

        if (direction === "right") {
            setLikedCats((prev) => [...prev, currentCat])
        }

        if (currentIndex === cats.length - 1) {
            setShowSummary(true)
        } else {
            setCurrentIndex((prev) => prev + 1)
        }
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return

        const touch = e.touches[0]
        const card = cardRef.current
        if (!card) return

        const rect = card.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const offsetX = touch.clientX - centerX
        const offsetY = touch.clientY - centerY

        setDragOffset({ x: offsetX, y: offsetY })
    }

    const handleTouchEnd = () => {

        if (!isDragging) return

        setIsDragging(false)

        const threshold = 100
        if (Math.abs(dragOffset.x) > threshold) {
            handleSwipe(dragOffset.x > 0 ? "right" : "left")
        }

        setDragOffset({ x: 0, y: 0 })
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return

        const card = cardRef.current
        if (!card) return

        const rect = card.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        // const offsetX = e.clientX - centerX
        const offsetX = clamp(e.clientX - centerX, -140, 140);
        const offsetY = e.clientY - centerY

        setDragOffset({ x: offsetX, y: offsetY })
    }

    const handleMouseUp = () => {
        if (!isDragging) return

        setIsDragging(false)

        const threshold = 100

        if (Math.abs(dragOffset.x)> threshold) {
            const direction = dragOffset.x > 0 ? "right" : "left";
            handleSwipe(direction);
        }

        setDragOffset({ x: 0, y: 0 })
    }

    const handleButton = (direction: "left" | "right") => {
        const offset = direction === "left" ? -140 : 140;
        // Apply the swipe transform
        setDragOffset({ x: offset, y: 0 });

        // Wait a frame before applying transition back to center
        setIsDragging(true);
        setTimeout(() => {
            setDragOffset({ x: 0, y: 0 });
            handleSwipe(direction); // Move to next card
            setIsDragging(false); // Reset dragging state
        }, 300);
    };

    const handleLeave = () => {
        // Wait a frame before applying transition back to center
        setIsDragging(false);
        setTimeout(() => {
            setDragOffset({ x: 0, y: 0 });
            setIsDragging(false); // Reset dragging state
        }, 300);
    }


    const resetApp = () => {
        generateCats()
        setCurrentIndex(0)
        setLikedCats([])
        setShowSummary(false)
        setDragOffset({ x: 0, y: 0 })
        setIsDragging(false)
        setIsLoading(true)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 mx-auto text-2xl text-center">🐱</div>
                    <p className="text-lg text-gray-600">Loading adorable cats...</p>
                </div>
            </div>
        )
    }

    if (showSummary) {
        return (
            <div className="p-4">
                <div className="max-w-md mx-auto pt-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Results! 🐱</h1>
                        <p className="text-lg text-gray-600">
                            You liked <span className="font-bold text-pink-600">{likedCats.length}</span> out of {cats.length} cats
                        </p>
                    </div>

                    {likedCats.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {likedCats.map((cat) => ( 
                                <Card key={cat.id} className="overflow-hidden hover:scale-105 transition-transform duration-200">
                                    <CardContent className="p-0">
                                        <div className="relative">
                                            <img
                                                src={cat.imageUrl || "/placeholder.svg"}
                                                alt={`Liked cat ${cat.id}`}
                                                className="object-fill h-full w-full"
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                            <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-1">
                                                <Heart className="w-4 h-4 text-white fill-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center mb-8">
                            <p className="text-gray-600 mb-4">No cats caught your fancy this time!</p>
                            <p className="text-sm text-gray-500">Maybe you're more of a dog person? 🐕</p>
                        </div>
                    )}

                    <Button onClick={resetApp} className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 text-lg">
                        <RotateCcw className="w-5 h-5 mr-2" />
                        More Cats
                    </Button>
                </div>
            </div>
        )
    }

    const currentCat = cats[currentIndex]
    const progress = ((currentIndex) / cats.length) * 100

    return (
        <div className="p-4 select-none">
            <div className="max-w-md mx-auto pt-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Paws & Preferences</h1>
                    <p className="text-gray-600">Find your favourite kitty! 🐾</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>
                            Cat {currentIndex + 1} of {cats.length}
                        </span>
                        <span>{likedCats.length} liked</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Card Stack */}
                <div className="relative h-96 mb-8">
                    {/* Next card (background) */}
                    {currentIndex + 1 < cats.length && (
                        <Card className="absolute inset-0 transform scale-95 opacity-50">
                            <CardContent className="p-0 h-full">
                                <div className="relative h-full rounded-lg overflow-hidden">
                                    <img
                                        src={cats[currentIndex + 1].imageUrl || "/placeholder.svg"}
                                        alt={`Cat ${cats[currentIndex + 1].id}`}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Current card */}
                    <Card
                        ref={cardRef}
                        className="absolute inset-0 cursor-grab active:cursor-grabbing duration-200
                            hover:scale-105 transition-all duration-400 shadow-xl hover:shadow-2xl overflow
                            touch-none"
                        style={{
                            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
                            opacity: isDragging ? 0.9 : 1,
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleLeave}
                    >
                        <CardContent className="p-0 h-full overflow-hidden">
                            <div className="relative h-full w-full rounded-lg overflow-hidden">
                                <img
                                    src={currentCat.imageUrl || "/placeholder.svg"}
                                    alt={`Cat ${currentCat.id}`}
                                    className="object-fill w-full h-full"
                                />

                                {/* Swipe indicators */}
                                {isDragging && (
                                    <>
                                        <div
                                            className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center transition-opacity"
                                            style={{ opacity: dragOffset.x > 50 ? 0.5 : 0 }}
                                        >
                                            <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg">LIKE</div>
                                        </div>
                                        <div
                                            className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center transition-opacity"
                                            style={{ opacity: dragOffset.x < -50 ? 0.5 : 0 }}
                                        >
                                            <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg">NOPE</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-6">
                    <Button
                        onClick={() => handleButton("left")}
                        size="lg"
                        variant="outline"
                        className="rounded-full w-16 h-16 border-2 border-red-300 hover:bg-red-50 hover:border-red-400"
                    >
                        <X className="w-8 h-8 text-red-500" />
                    </Button>
                    <Button
                        onClick={() => handleButton("right")}
                        size="lg"
                        variant="outline"
                        className="rounded-full w-16 h-16 border-2 border-green-300 hover:bg-green-50 hover:border-green-400"
                    >
                        <Heart className="w-8 h-8 text-green-500" />
                    </Button>
                </div>

                {/* Instructions */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    <p>Swipe right to like, left to pass</p>
                    <p>Or use the buttons below</p>
                </div>
            </div>
        </div>
    )
}