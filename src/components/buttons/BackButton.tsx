import { Button } from "@heroui/button"

interface BackButtonProps {
    onBack: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onBack }) => {
    return <Button
        variant="bordered"
        size="md"
        onPress={onBack}
        className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-gray-50"
    >
        Back
    </Button>
}

export default BackButton;