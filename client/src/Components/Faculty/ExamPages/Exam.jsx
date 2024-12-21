import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { FileText, Database, ListTodo } from "lucide-react";

const ExamContent = () => {
    const [activeView, setActiveView] = useState("create");

    return (
        <div className="m-5 p-5 rounded-md border-[#5E17EB] border-2">
            <Card className="bg-white border border-[#5E17EB]">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-[#5E17EB] mb-5">
                        Exam Conduction
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        {/* Create New Exam Button */}
                        <Card
                            className={`border border-[#D3A4F9] cursor-pointer hover:border-[#5E17EB] transition-colors ${
                                activeView === "create"
                                    ? "border-[#5E17EB]"
                                    : ""
                            }`}
                            onClick={() => setActiveView("create")}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <FileText className="w-12 h-12 text-[#5E17EB] mb-2" />
                                <h3 className="font-semibold text-lg">
                                    Create New Exam
                                </h3>
                            </CardContent>
                        </Card>

                        {/* PYQ Database Button */}
                        <Card
                            className={`border border-[#D3A4F9] cursor-pointer hover:border-[#5E17EB] transition-colors ${
                                activeView === "pyq" ? "border-[#5E17EB]" : ""
                            }`}
                            onClick={() => setActiveView("pyq")}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <Database className="w-12 h-12 text-[#5E17EB] mb-2" />
                                <h3 className="font-semibold text-lg">
                                    PYQ Database
                                </h3>
                            </CardContent>
                        </Card>

                        {/* Created Exams Button */}
                        <Card
                            className={`border border-[#D3A4F9] cursor-pointer hover:border-[#5E17EB] transition-colors ${
                                activeView === "created"
                                    ? "border-[#5E17EB]"
                                    : ""
                            }`}
                            onClick={() => setActiveView("created")}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <ListTodo className="w-12 h-12 text-[#5E17EB] mb-2" />
                                <h3 className="font-semibold text-lg">
                                    Created Exams
                                </h3>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExamContent;
