export const SUBJECTS: Record<string, string[]> = {
    "Computer Science": [
        "Web Development",
        "Mobile Development",
        "Data Science",
        "Machine Learning",
        "Cybersecurity",
        "Algorithms",
        "Database Design"
    ],
    "Mathematics": [
        "Algebra",
        "Calculus",
        "Geometry",
        "Statistics",
        "Linear Algebra",
        "Discrete Mathematics"
    ],
    "Physics": [
        "Mechanics",
        "Thermodynamics",
        "Electromagnetism",
        "Quantum Physics",
        "Optics"
    ],
    "Chemistry": [
        "Organic Chemistry",
        "Inorganic Chemistry",
        "Physical Chemistry",
        "Biochemistry"
    ],
    "Biology": [
        "Cell Biology",
        "Genetics",
        "Microbiology",
        "Ecology",
        "Human Anatomy"
    ],
    "Engineering": [
        "Civil Engineering",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Chemical Engineering",
        "Aerospace Engineering"
    ],
    "Business": [
        "Marketing",
        "Finance",
        "Accounting",
        "Management",
        "Entrepreneurship"
    ],
    "Arts & Humanities": [
        "History",
        "Literature",
        "Philosophy",
        "Music",
        "Visual Arts"
    ],
    "Languages": [
        "English",
        "Spanish",
        "French",
        "German",
        "Chinese",
        "Japanese"
    ]
}

export type Subject = keyof typeof SUBJECTS
