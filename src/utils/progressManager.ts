/**
 * Course Progress Manager using LocalStorage
 */

export interface LessonProgress {
    sectionIndex: number;
    lessonIndex: number;
    completed: boolean;
    completedAt?: string; // ISO timestamp
}

export interface CourseProgress {
    courseId: string;
    lessons: Map<string, LessonProgress>; // key: "sectionIndex_lessonIndex"
    totalLessons: number;
    completedLessons: number;
    percentageComplete: number;
    lastUpdated: string;
}

const STORAGE_KEY_PREFIX = 'course_progress_';

/**
 * Get lesson key for storage
 */
function getLessonKey(sectionIndex: number, lessonIndex: number): string {
    return `${sectionIndex}_${lessonIndex}`;
}

/**
 * Load progress from localStorage
 */
export function loadCourseProgress(courseId: string): CourseProgress | null {
    try {
        const key = `${STORAGE_KEY_PREFIX}${courseId}`;
        const data = localStorage.getItem(key);

        if (!data) {
            return null;
        }

        const parsed = JSON.parse(data);

        // Convert lessons object back to Map
        const lessonsMap = new Map<string, LessonProgress>();
        if (parsed.lessons) {
            Object.entries(parsed.lessons).forEach(([key, value]) => {
                lessonsMap.set(key, value as LessonProgress);
            });
        }

        return {
            ...parsed,
            lessons: lessonsMap,
        };
    } catch (error) {
        console.error('Error loading course progress:', error);
        return null;
    }
}

/**
 * Save progress to localStorage
 */
export function saveCourseProgress(progress: CourseProgress): void {
    try {
        const key = `${STORAGE_KEY_PREFIX}${progress.courseId}`;

        // Convert Map to object for JSON serialization
        const lessonsObj: Record<string, LessonProgress> = {};
        progress.lessons.forEach((value, key) => {
            lessonsObj[key] = value;
        });

        const dataToSave = {
            ...progress,
            lessons: lessonsObj,
            lastUpdated: new Date().toISOString(),
        };

        localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (error) {
        console.error('Error saving course progress:', error);
    }
}

/**
 * Initialize progress for a new course
 */
export function initializeCourseProgress(
    courseId: string,
    totalLessons: number
): CourseProgress {
    const progress: CourseProgress = {
        courseId,
        lessons: new Map(),
        totalLessons,
        completedLessons: 0,
        percentageComplete: 0,
        lastUpdated: new Date().toISOString(),
    };

    saveCourseProgress(progress);
    return progress;
}

/**
 * Mark a lesson as completed
 */
export function markLessonComplete(
    courseId: string,
    sectionIndex: number,
    lessonIndex: number,
    totalLessons: number
): CourseProgress {
    let progress = loadCourseProgress(courseId);

    if (!progress) {
        progress = initializeCourseProgress(courseId, totalLessons);
    }

    const lessonKey = getLessonKey(sectionIndex, lessonIndex);

    // Check if already completed
    const existing = progress.lessons.get(lessonKey);
    if (existing?.completed) {
        return progress; // Already completed, no change
    }

    // Mark as completed
    progress.lessons.set(lessonKey, {
        sectionIndex,
        lessonIndex,
        completed: true,
        completedAt: new Date().toISOString(),
    });

    // Update counts
    progress.completedLessons = Array.from(progress.lessons.values()).filter(
        (l) => l.completed
    ).length;

    progress.percentageComplete = Math.round(
        (progress.completedLessons / progress.totalLessons) * 100
    );

    saveCourseProgress(progress);
    return progress;
}

/**
 * Check if lesson is completed
 */
export function isLessonCompleted(
    courseId: string,
    sectionIndex: number,
    lessonIndex: number
): boolean {
    const progress = loadCourseProgress(courseId);
    if (!progress) return false;

    const lessonKey = getLessonKey(sectionIndex, lessonIndex);
    return progress.lessons.get(lessonKey)?.completed || false;
}

/**
 * Check if course is 100% complete
 */
export function isCourseComplete(courseId: string): boolean {
    const progress = loadCourseProgress(courseId);
    if (!progress) return false;

    return progress.percentageComplete >= 100;
}

/**
 * Get completion percentage
 */
export function getCompletionPercentage(courseId: string): number {
    const progress = loadCourseProgress(courseId);
    return progress ? progress.percentageComplete : 0;
}

/**
 * Reset course progress (for testing)
 */
export function resetCourseProgress(courseId: string): void {
    const key = `${STORAGE_KEY_PREFIX}${courseId}`;
    localStorage.removeItem(key);
}
