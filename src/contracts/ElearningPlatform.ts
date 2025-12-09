export const elearningPlatformAddress =
    "0xb1E592EEaCBBf221B95A2cEF4dddA5e8D62E994A";
    "0x6C248d2Dd481f768aca7F5DA05FBdaafdF058310";

export const elearningPlatformABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "certificateNFTAddress",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "courseId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "instructor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "contentCid",
          "type": "string"
        }
      ],
      "name": "CourseCreated",
      "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "student",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "courseId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            }
        ],
        "name": "CoursePurchased",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "certificateNFT",
        "outputs": [
            {
                "internalType": "contract ICertificateNFT",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
      "inputs": [],
      "name": "certificateNFT",
      "outputs": [
        {
          "internalType": "contract ICertificateNFT",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "courses",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "instructor",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "contentCid",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "contentCid",
          "type": "string"
        }
      ],
      "name": "createCourse",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "courseId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllCourse",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "instructor",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "contentCid",
              "type": "string"
            }
          ],
          "internalType": "struct ElearningPlatform.Course[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
        "inputs": [],
        "name": "nextCourseId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_courseId",
                "type": "uint256"
            }
        ],
        "name": "purchaseCourse",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_student",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_courseId",
                "type": "uint256"
            }
        ],
        "name": "hasPurchasedCourse",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_student",
                "type": "address"
            }
        ],
        "name": "getPurchasedCourses",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_courseId",
                "type": "uint256"
            }
        ],
        "name": "getCourseContentCid",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_student",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_courseId",
                "type": "uint256"
            }
        ],
        "name": "getPurchasedCourseContentCid",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "purchases",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
      "inputs": [],
      "name": "nextCourseId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
] as const;